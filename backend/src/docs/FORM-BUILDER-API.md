# Form Builder API Documentation

## Overview

The Form Builder System provides a comprehensive solution for creating, managing, and processing dynamic forms in the LEAD101 platform. It supports advanced features like conditional logic, multi-step forms, validation, analytics, and widget generation.

## Architecture

### Core Components

1. **FormBuilderService** - Main service for form management
2. **ConditionalLogicEngine** - Handles conditional field logic
3. **FormValidationService** - Validates form data and configurations
4. **Form Routes** - REST API endpoints for form operations

### Database Models

- **Form** - Main form configuration
- **FormField** - Individual form fields with validation rules
- **FormStep** - Multi-step form configuration
- **FormSubmission** - Form submission data
- **FormWidget** - Embeddable form widgets
- **FormTemplate** - Reusable form templates
- **FormAnalytics** - Form performance analytics

## API Endpoints

### Form Management

#### Create Form

```http
POST /api/forms
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Student Application Form",
  "description": "Application form for new students",
  "requiresPayment": true,
  "paymentAmount": 500,
  "allowMultipleSubmissions": false,
  "maxSubmissions": 100,
  "submissionDeadline": "2024-12-31T23:59:59Z",
  "settings": {
    "theme": {
      "primaryColor": "#3b82f6",
      "secondaryColor": "#6b7280"
    },
    "layout": {
      "width": "full",
      "alignment": "left"
    }
  }
}
```

#### Get Forms List

```http
GET /api/forms?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Form by ID

```http
GET /api/forms/{formId}
Authorization: Bearer <token>
```

#### Update Form

```http
PUT /api/forms/{formId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Form Title",
  "isActive": true
}
```

#### Delete Form

```http
DELETE /api/forms/{formId}
Authorization: Bearer <token>
```

### Field Management

#### Create Field

```http
POST /api/forms/{formId}/fields
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "text",
  "label": "Full Name",
  "placeholder": "Enter your full name",
  "required": true,
  "order": 1,
  "width": "full",
  "validation": {
    "minLength": 2,
    "maxLength": 100,
    "errorMessage": "Name must be between 2 and 100 characters"
  },
  "conditionalLogic": {
    "enabled": false,
    "conditions": [],
    "actions": []
  },
  "options": {},
  "styling": {
    "backgroundColor": "#ffffff",
    "textColor": "#000000"
  }
}
```

#### Get Form Fields

```http
GET /api/forms/{formId}/fields
Authorization: Bearer <token>
```

#### Update Field

```http
PUT /api/forms/{formId}/fields/{fieldId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Updated Field Label",
  "required": false
}
```

#### Delete Field

```http
DELETE /api/forms/{formId}/fields/{fieldId}
Authorization: Bearer <token>
```

### Form Submission

#### Submit Form (Public)

```http
POST /api/forms/{formId}/submit
Content-Type: application/json

{
  "data": {
    "field1": "John Doe",
    "field2": "john@example.com",
    "field3": "1234567890"
  },
  "metadata": {
    "source": "website",
    "campaign": "summer-2024"
  }
}
```

#### Get Form Submissions (Admin)

```http
GET /api/forms/{formId}/submissions?page=1&limit=10
Authorization: Bearer <token>
```

### Widget Management

#### Create Widget

```http
POST /api/forms/{formId}/widgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Contact Form Widget",
  "type": "popup",
  "settings": {
    "trigger": {
      "type": "delay",
      "delay": 5
    },
    "styling": {
      "position": "bottom-right",
      "size": "medium"
    }
  }
}
```

### Analytics

#### Get Form Analytics

```http
GET /api/forms/{formId}/analytics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### Templates

#### Get Templates

```http
GET /api/forms/templates?category=admission&isPublic=true
```

#### Create Template

```http
POST /api/forms/templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Student Registration Template",
  "description": "Template for student registration forms",
  "category": "admission",
  "isPublic": true,
  "isPremium": false,
  "formConfig": { /* Form configuration */ },
  "fields": [ /* Field definitions */ ],
  "steps": [ /* Step definitions */ ],
  "tags": ["registration", "student", "admission"]
}
```

## Field Types

### Supported Field Types

1. **Text Fields**

   - `text` - Single line text input
   - `textarea` - Multi-line text input
   - `email` - Email input with validation
   - `phone` - Phone number input
   - `url` - URL input with validation
   - `password` - Password input

2. **Number Fields**

   - `number` - Numeric input
   - `slider` - Range slider
   - `rating` - Star rating input

3. **Selection Fields**

   - `select` - Dropdown selection
   - `multiselect` - Multiple selection
   - `radio` - Radio button group
   - `checkbox` - Checkbox group

4. **Date/Time Fields**

   - `date` - Date picker
   - `time` - Time picker
   - `datetime` - Date and time picker

5. **File Fields**

   - `file` - File upload
   - `signature` - Digital signature

6. **Layout Fields**

   - `divider` - Visual divider
   - `heading` - Section heading
   - `paragraph` - Text content

7. **Advanced Fields**
   - `calculation` - Calculated field
   - `payment` - Payment integration
   - `hidden` - Hidden field

## Conditional Logic

### Condition Types

- `equals` - Field value equals specified value
- `not_equals` - Field value does not equal specified value
- `contains` - Field value contains specified text
- `not_contains` - Field value does not contain specified text
- `greater_than` - Field value is greater than specified value
- `less_than` - Field value is less than specified value
- `is_empty` - Field value is empty
- `is_not_empty` - Field value is not empty

### Action Types

- `show` - Show target field
- `hide` - Hide target field
- `require` - Make target field required
- `make_optional` - Make target field optional
- `enable` - Enable target field
- `disable` - Disable target field
- `set_value` - Set target field value
- `clear_value` - Clear target field value

### Example Conditional Logic

```json
{
  "enabled": true,
  "conditions": [
    {
      "id": "cond1",
      "fieldId": "student_type",
      "operator": "equals",
      "value": "international",
      "logic": "and"
    }
  ],
  "actions": [
    {
      "id": "action1",
      "type": "show",
      "targetFieldId": "passport_number"
    },
    {
      "id": "action2",
      "type": "require",
      "targetFieldId": "passport_number"
    }
  ]
}
```

## Validation Rules

### Field Validation

```json
{
  "required": true,
  "minLength": 2,
  "maxLength": 100,
  "min": 0,
  "max": 100,
  "pattern": "^[A-Za-z\\s]+$",
  "customValidation": "return value.length > 0 && value.includes('@');",
  "errorMessage": "Custom error message"
}
```

### Form Validation

The system automatically validates:

- Required fields
- Email format
- Phone number format
- Number ranges
- File types and sizes
- Custom validation rules

## Multi-Step Forms

### Step Configuration

```json
{
  "id": "step1",
  "formId": "form123",
  "title": "Personal Information",
  "description": "Enter your personal details",
  "order": 1,
  "isActive": true,
  "fields": ["field1", "field2", "field3"],
  "conditions": {
    "enabled": false,
    "conditions": [],
    "actions": []
  },
  "settings": {
    "showProgress": true,
    "allowBack": true,
    "allowSkip": false,
    "autoSave": true,
    "validationMode": "on_next"
  }
}
```

## Widget Types

### Supported Widget Types

1. **Popup** - Modal popup form
2. **Embed** - Inline embedded form
3. **Floating** - Floating action button
4. **Slide In** - Slide-in panel
5. **Fullscreen** - Full-screen overlay
6. **Button** - Trigger button

### Widget Settings

```json
{
  "trigger": {
    "type": "delay",
    "delay": 5,
    "scrollPercentage": 50
  },
  "styling": {
    "position": "bottom-right",
    "size": "medium",
    "theme": "light",
    "borderRadius": 8
  },
  "behavior": {
    "showCloseButton": true,
    "allowOutsideClick": true,
    "preventBodyScroll": true
  }
}
```

## Analytics

### Metrics Tracked

- Total views
- Total submissions
- Conversion rate
- Average completion time
- Bounce rate
- Device breakdown
- Source performance
- Field-level analytics

### Analytics Response

```json
{
  "formId": "form123",
  "period": "month",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "metrics": {
    "totalViews": 1000,
    "totalSubmissions": 150,
    "conversionRate": 0.15,
    "averageCompletionTime": 300,
    "bounceRate": 0.25
  },
  "charts": {
    "viewsOverTime": [
      { "date": "2024-01-01", "value": 50 },
      { "date": "2024-01-02", "value": 75 }
    ],
    "submissionsOverTime": [
      { "date": "2024-01-01", "value": 10 },
      { "date": "2024-01-02", "value": 15 }
    ]
  }
}
```

## Error Handling

### Error Codes

- `FORM_NOT_FOUND` - Form does not exist
- `FIELD_NOT_FOUND` - Field does not exist
- `INVALID_FIELD_TYPE` - Invalid field type
- `VALIDATION_ERROR` - Form validation failed
- `SUBMISSION_LIMIT_EXCEEDED` - Maximum submissions reached
- `PAYMENT_REQUIRED` - Payment required for submission
- `PAYMENT_FAILED` - Payment processing failed
- `TEMPLATE_NOT_FOUND` - Template does not exist
- `WIDGET_NOT_FOUND` - Widget does not exist
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `TENANT_NOT_FOUND` - Tenant does not exist
- `INVALID_CONFIGURATION` - Invalid form configuration
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `FILE_TOO_LARGE` - Uploaded file too large
- `INVALID_FILE_TYPE` - Invalid file type
- `CAPTCHA_FAILED` - CAPTCHA verification failed
- `SUBMISSION_EXPIRED` - Form submission deadline passed

### Error Response Format

```json
{
  "success": false,
  "error": "Form not found",
  "code": "FORM_NOT_FOUND",
  "details": {
    "fieldId": "field123",
    "message": "Additional error details"
  }
}
```

## Security Features

### Data Protection

- Input sanitization to prevent XSS attacks
- File type and size validation
- Rate limiting on submissions
- CAPTCHA integration
- IP whitelisting support

### Access Control

- Role-based permissions
- Tenant isolation
- Form-level access control
- Submission privacy controls

## Performance Considerations

### Optimization Features

- Database indexing on frequently queried fields
- Caching for form configurations
- Lazy loading for large forms
- Pagination for submissions
- Efficient conditional logic evaluation

### Scalability

- Multi-tenant architecture
- Horizontal scaling support
- Database query optimization
- CDN integration for static assets

## Best Practices

### Form Design

1. Keep forms concise and focused
2. Use clear, descriptive labels
3. Group related fields logically
4. Provide helpful placeholder text
5. Use appropriate field types
6. Implement progressive disclosure

### Validation

1. Validate on both client and server
2. Provide immediate feedback
3. Use clear error messages
4. Implement custom validation rules
5. Test edge cases thoroughly

### Performance

1. Minimize form complexity
2. Use conditional logic judiciously
3. Optimize images and files
4. Implement caching strategies
5. Monitor analytics regularly

## Integration Examples

### Frontend Integration

```javascript
// Load form widget
const widget = document.createElement("script");
widget.src = "https://your-domain.com/widgets/embed.js";
widget.setAttribute("data-form-id", "form123");
document.head.appendChild(widget);

// Handle form submission
window.addEventListener("formSubmitted", (event) => {
  console.log("Form submitted:", event.detail);
});
```

### Webhook Integration

```json
{
  "url": "https://your-webhook.com/form-submission",
  "events": ["submission.created", "submission.updated"],
  "headers": {
    "Authorization": "Bearer your-token"
  }
}
```

## Troubleshooting

### Common Issues

1. **Form not loading** - Check form ID and permissions
2. **Validation errors** - Verify field configuration
3. **Submission failures** - Check rate limits and validation
4. **Widget not displaying** - Verify embed code and settings
5. **Analytics not tracking** - Check tracking configuration

### Debug Mode

Enable debug mode by setting the `DEBUG` environment variable:

```bash
DEBUG=form-builder npm start
```

This will provide detailed logging for form operations and help identify issues.

## Support

For technical support and questions:

- Documentation: `/docs/form-builder`
- API Reference: `/api/docs`
- Support Email: support@lead101.com
- GitHub Issues: https://github.com/lead101/issues

---

**Last Updated**: October 2024  
**Version**: 1.0  
**Status**: Production Ready
