import type {
  FormField,
  ConditionalLogic,
  RuleGroup,
  Condition,
} from "@/types/form-builder";

/**
 * Evaluates a single condition against form data
 */
export function evaluateCondition(
  triggerValue: unknown,
  conditionValue: unknown,
  operator: string
): boolean {
  switch (operator) {
    case "equals":
      return triggerValue === conditionValue;
    case "not_equals":
      return triggerValue !== conditionValue;
    case "contains":
      return String(triggerValue).includes(String(conditionValue));
    case "not_contains":
      return !String(triggerValue).includes(String(conditionValue));
    case "greater_than":
      return Number(triggerValue) > Number(conditionValue);
    case "less_than":
      return Number(triggerValue) < Number(conditionValue);
    case "is_empty":
      return !triggerValue || String(triggerValue).trim() === "";
    case "is_not_empty":
      return triggerValue && String(triggerValue).trim() !== "";
    default:
      console.warn(`Unknown operator: ${operator}`);
      return true;
  }
}

/**
 * Evaluates a rule group against form data
 */
export function evaluateRuleGroup(
  ruleGroup: RuleGroup,
  formData: Record<string, unknown>,
  allFields: FormField[]
): boolean {
  const conditionResults = ruleGroup.conditions.map((condition) => {
    const triggerField = allFields.find((f) => f.id === condition.fieldId);
    if (!triggerField) {
      console.warn(`Trigger field not found for condition:`, condition);
      return false;
    }

    const triggerValue = formData[triggerField.id];
    const conditionValue = condition.value;

    return evaluateCondition(triggerValue, conditionValue, condition.operator);
  });

  // Apply rule group operator (AND/OR)
  return ruleGroup.operator === "AND"
    ? conditionResults.every((result) => result)
    : conditionResults.some((result) => result);
}

/**
 * Evaluates conditional logic for a field against form data
 */
export function evaluateConditionalLogic(
  field: FormField,
  formData: Record<string, unknown>,
  allFields: FormField[]
): boolean {
  if (
    !field.conditionalLogic?.enabled ||
    !field.conditionalLogic?.ruleGroups?.length
  ) {
    return true; // Show field if no conditional logic
  }

  // Evaluate rule groups based on the main logic operator
  const ruleGroupResults = field.conditionalLogic.ruleGroups.map((ruleGroup) =>
    evaluateRuleGroup(ruleGroup, formData, allFields)
  );

  // Apply main logic operator (AND/OR)
  return field.conditionalLogic.logicOperator === "AND"
    ? ruleGroupResults.every((result) => result)
    : ruleGroupResults.some((result) => result);
}

/**
 * Gets visible fields based on conditional logic evaluation
 */
export function getVisibleFields(
  fields: FormField[],
  formData: Record<string, unknown>,
  allFields: FormField[] = fields
): FormField[] {
  return fields.filter((field) =>
    evaluateConditionalLogic(field, formData, allFields)
  );
}

/**
 * Applies conditional logic actions to form data
 */
export function applyConditionalLogicActions(
  field: FormField,
  formData: Record<string, unknown>,
  allFields: FormField[]
): Record<string, unknown> {
  if (
    !field.conditionalLogic?.enabled ||
    !field.conditionalLogic?.actions?.length
  ) {
    return formData;
  }

  // Check if conditions are met
  const conditionsMet = evaluateConditionalLogic(field, formData, allFields);

  if (!conditionsMet) {
    return formData;
  }

  // Apply actions
  const updatedFormData = { ...formData };

  for (const action of field.conditionalLogic.actions) {
    const targetField = allFields.find((f) => f.id === action.targetFieldId);
    if (!targetField) continue;

    switch (action.type) {
      case "show":
        // Field visibility is handled by getVisibleFields
        break;
      case "hide":
        // Field visibility is handled by getVisibleFields
        break;
      case "require":
        // This would need to be handled by the form validation system
        break;
      case "make_optional":
        // This would need to be handled by the form validation system
        break;
      case "enable":
        // This would need to be handled by the form field state
        break;
      case "disable":
        // This would need to be handled by the form field state
        break;
      case "set_value":
        if (action.value !== undefined) {
          updatedFormData[action.targetFieldId] = action.value;
        }
        break;
      case "clear_value":
        updatedFormData[action.targetFieldId] = "";
        break;
    }
  }

  return updatedFormData;
}
