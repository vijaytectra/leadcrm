import {
  ConditionalLogic,
  Condition,
  Action,
  FormField,
  FormSubmissionValue,
} from "../types/form-builder";

export class ConditionalLogicEngine {
  /**
   * Evaluate conditional logic for a form field
   * @param logic - The conditional logic configuration
   * @param formData - Current form submission data
   * @param allFields - All form fields for reference
   * @returns Whether the conditions are met
   */
  static evaluateConditions(
    logic: ConditionalLogic,
    formData: Record<string, FormSubmissionValue>,
    allFields: FormField[]
  ): boolean {
    if (!logic.enabled || !logic.conditions.length) {
      return true;
    }

    const fieldMap = new Map(allFields.map((field) => [field.id, field]));

    // Group conditions by logic operators
    const conditionGroups = this.groupConditionsByLogic(logic.conditions);

    // Evaluate each group
    const groupResults = conditionGroups.map((group) =>
      this.evaluateConditionGroup(group, formData, fieldMap)
    );

    // Combine group results with AND logic
    return groupResults.every((result) => result);
  }

  /**
   * Execute actions based on conditional logic
   * @param logic - The conditional logic configuration
   * @param formData - Current form submission data
   * @param allFields - All form fields for reference
   * @returns Updated form data with actions applied
   */
  static executeActions(
    logic: ConditionalLogic,
    formData: Record<string, FormSubmissionValue>,
    allFields: FormField[]
  ): Record<string, FormSubmissionValue> {
    if (!logic.enabled || !logic.actions.length) {
      return formData;
    }

    const conditionsMet = this.evaluateConditions(logic, formData, allFields);
    if (!conditionsMet) {
      return formData;
    }

    const updatedData = { ...formData };
    const fieldMap = new Map(allFields.map((field) => [field.id, field]));

    for (const action of logic.actions) {
      updatedData[action.targetFieldId] = this.executeAction(
        action,
        formData,
        fieldMap
      );
    }

    return updatedData;
  }

  /**
   * Validate conditional logic configuration
   * @param logic - The conditional logic to validate
   * @param allFields - All form fields for reference
   * @returns Validation result with errors if any
   */
  static validateLogic(
    logic: ConditionalLogic,
    allFields: FormField[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const fieldIds = new Set(allFields.map((field) => field.id));

    // Validate conditions
    for (const condition of logic.conditions) {
      if (!fieldIds.has(condition.fieldId)) {
        errors.push(
          `Condition references non-existent field: ${condition.fieldId}`
        );
      }

      if (!this.isValidOperator(condition.operator)) {
        errors.push(`Invalid operator: ${condition.operator}`);
      }

      if (!this.isValidLogicOperator(condition.logic)) {
        errors.push(`Invalid logic operator: ${condition.logic}`);
      }
    }

    // Validate actions
    for (const action of logic.actions) {
      if (!fieldIds.has(action.targetFieldId)) {
        errors.push(
          `Action targets non-existent field: ${action.targetFieldId}`
        );
      }

      if (!this.isValidActionType(action.type)) {
        errors.push(`Invalid action type: ${action.type}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get fields that should be visible based on current form data
   * @param allFields - All form fields
   * @param formData - Current form submission data
   * @returns Array of field IDs that should be visible
   */
  static getVisibleFields(
    allFields: FormField[],
    formData: Record<string, FormSubmissionValue>
  ): string[] {
    const visibleFields: string[] = [];
    const fieldMap = new Map(allFields.map((field) => [field.id, field]));

    for (const field of allFields) {
      if (!field.conditionalLogic?.enabled) {
        visibleFields.push(field.id);
        continue;
      }

      const isVisible = this.evaluateConditions(
        field.conditionalLogic,
        formData,
        allFields
      );

      if (isVisible) {
        visibleFields.push(field.id);
      }
    }

    return visibleFields;
  }

  /**
   * Get required fields based on current form data and conditional logic
   * @param allFields - All form fields
   * @param formData - Current form submission data
   * @returns Array of field IDs that are required
   */
  static getRequiredFields(
    allFields: FormField[],
    formData: Record<string, FormSubmissionValue>
  ): string[] {
    const requiredFields: string[] = [];
    const fieldMap = new Map(allFields.map((field) => [field.id, field]));

    for (const field of allFields) {
      if (!field.required) continue;

      // Check if field is visible
      const isVisible =
        !field.conditionalLogic?.enabled ||
        this.evaluateConditions(field.conditionalLogic, formData, allFields);

      if (isVisible) {
        requiredFields.push(field.id);
      }
    }

    return requiredFields;
  }

  // Private helper methods
  private static groupConditionsByLogic(
    conditions: Condition[]
  ): Condition[][] {
    const groups: Condition[][] = [];
    let currentGroup: Condition[] = [];

    for (const condition of conditions) {
      if (condition.logic === "and" && currentGroup.length > 0) {
        groups.push([...currentGroup]);
        currentGroup = [condition];
      } else {
        currentGroup.push(condition);
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  private static evaluateConditionGroup(
    conditions: Condition[],
    formData: Record<string, FormSubmissionValue>,
    fieldMap: Map<string, FormField>
  ): boolean {
    if (conditions.length === 0) return true;

    // First condition is always evaluated
    let result = this.evaluateCondition(conditions[0], formData, fieldMap);

    // Evaluate remaining conditions with their logic operators
    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(
        condition,
        formData,
        fieldMap
      );

      if (condition.logic === "and") {
        result = result && conditionResult;
      } else if (condition.logic === "or") {
        result = result || conditionResult;
      }
    }

    return result;
  }

  private static evaluateCondition(
    condition: Condition,
    formData: Record<string, FormSubmissionValue>,
    fieldMap: Map<string, FormField>
  ): boolean {
    const fieldValue = formData[condition.fieldId];
    const field = fieldMap.get(condition.fieldId);

    if (!field) return false;

    switch (condition.operator) {
      case "equals":
        return this.compareValues(fieldValue, condition.value, "equals");

      case "not_equals":
        return this.compareValues(fieldValue, condition.value, "not_equals");

      case "contains":
        return this.compareValues(fieldValue, condition.value, "contains");

      case "not_contains":
        return this.compareValues(fieldValue, condition.value, "not_contains");

      case "greater_than":
        return this.compareValues(fieldValue, condition.value, "greater_than");

      case "less_than":
        return this.compareValues(fieldValue, condition.value, "less_than");

      case "is_empty":
        return this.isEmpty(fieldValue);

      case "is_not_empty":
        return !this.isEmpty(fieldValue);

      default:
        return false;
    }
  }

  private static compareValues(
    fieldValue: FormSubmissionValue,
    conditionValue: string | number | boolean,
    operator: string
  ): boolean {
    if (fieldValue === undefined || fieldValue === null) {
      return operator === "is_empty";
    }

    // Convert values to strings for comparison
    const fieldStr = String(fieldValue).toLowerCase();
    const conditionStr = String(conditionValue).toLowerCase();

    switch (operator) {
      case "equals":
        return fieldStr === conditionStr;

      case "not_equals":
        return fieldStr !== conditionStr;

      case "contains":
        return fieldStr.includes(conditionStr);

      case "not_contains":
        return !fieldStr.includes(conditionStr);

      case "greater_than":
        return this.compareNumbers(fieldValue, conditionValue, ">");

      case "less_than":
        return this.compareNumbers(fieldValue, conditionValue, "<");

      default:
        return false;
    }
  }

  private static compareNumbers(
    fieldValue: FormSubmissionValue,
    conditionValue: string | number | boolean,
    operator: string
  ): boolean {
    const fieldNum = Number(fieldValue);
    const conditionNum = Number(conditionValue);

    if (isNaN(fieldNum) || isNaN(conditionNum)) {
      return false;
    }

    switch (operator) {
      case ">":
        return fieldNum > conditionNum;
      case "<":
        return fieldNum < conditionNum;
      case ">=":
        return fieldNum >= conditionNum;
      case "<=":
        return fieldNum <= conditionNum;
      default:
        return false;
    }
  }

  private static isEmpty(value: FormSubmissionValue): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    return false;
  }

  private static executeAction(
    action: Action,
    formData: Record<string, FormSubmissionValue>,
    fieldMap: Map<string, FormField>
  ): FormSubmissionValue {
    const currentValue = formData[action.targetFieldId];
    const field = fieldMap.get(action.targetFieldId);

    if (!field) return currentValue;

    switch (action.type) {
      case "show":
      case "hide":
      case "enable":
      case "disable":
        // These are UI state changes, not data changes
        return currentValue;

      case "require":
      case "make_optional":
        // These affect field validation, not data
        return currentValue;

      case "set_value":
        return action.value !== undefined ? action.value : currentValue;

      case "clear_value":
        return field.type === "checkbox"
          ? false
          : field.type === "multiselect"
          ? []
          : field.type === "number"
          ? 0
          : "";

      default:
        return currentValue;
    }
  }

  private static isValidOperator(operator: string): boolean {
    const validOperators = [
      "equals",
      "not_equals",
      "contains",
      "not_contains",
      "greater_than",
      "less_than",
      "is_empty",
      "is_not_empty",
    ];
    return validOperators.includes(operator);
  }

  private static isValidLogicOperator(logic: string): boolean {
    return logic === "and" || logic === "or";
  }

  private static isValidActionType(type: string): boolean {
    const validActions = [
      "show",
      "hide",
      "require",
      "make_optional",
      "enable",
      "disable",
      "set_value",
      "clear_value",
    ];
    return validActions.includes(type);
  }
}

export const conditionalLogicEngine = new ConditionalLogicEngine();
