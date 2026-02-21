# Demo Mode Implementation Guide

## Overview
The demo mode system prevents data modifications when users log in with the demo admin account (`admin@metaagency.id`). This allows visitors to explore the full admin interface without being able to actually modify or delete data.

## Features
- ✅ Demo banner displayed at the top of admin pages
- ✅ Toast notifications when users try to modify data
- ✅ Simple API to protect any action
- ✅ Already integrated throughout the app

## How to Use

### 1. In React Components

Import the `useDemoMode` hook:

```jsx
import { useDemoMode } from '../contexts/DemoModeContext';

function MyComponent() {
  const { isDemoMode, withDemoCheck, showDemoRestriction } = useDemoMode();

  // Option 1: Check if demo mode before showing UI
  if (isDemoMode) {
    return <p>Demo mode - read only</p>;
  }

  // Option 2: Wrap delete/edit actions
  const handleDelete = withDemoCheck(async (id) => {
    // This will only execute if NOT in demo mode
    await deleteItem(id);
  });

  // Option 3: Manual check
  const handleEdit = async () => {
    if (isDemoMode) {
      showDemoRestriction();
      return;
    }
    // Proceed with edit
  };

  return (
    <button onClick={() => handleDelete(123)}>
      Delete Item
    </button>
  );
}
```

### 2. Protect Form Submissions

```jsx
import { useDemoMode } from '../contexts/DemoModeContext';

function ArticleForm() {
  const { withDemoCheck } = useDemoMode();

  const handleSubmit = withDemoCheck(async (formData) => {
    // This only runs if NOT in demo mode
    const { data, error } = await supabase
      .from('articles')
      .insert(formData);

    if (!error) {
      toast.success('Article created!');
    }
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(formData);
    }}>
      {/* form fields */}
    </form>
  );
}
```

### 3. Protect Delete/Update Operations

```jsx
import { useDemoMode } from '../contexts/DemoModeContext';

function TalentTable() {
  const { withDemoCheck } = useDemoMode();

  const handleDelete = withDemoCheck(async (talentId) => {
    const { error } = await supabase
      .from('creators')
      .delete()
      .eq('id', talentId);

    if (!error) {
      // Refresh list
    }
  });

  const handleUpdate = withDemoCheck(async (talentId, updates) => {
    const { error } = await supabase
      .from('creators')
      .update(updates)
      .eq('id', talentId);
  });

  return (
    <table>
      {/* ... */}
      <button onClick={() => handleDelete(talent.id)}>Delete</button>
      <button onClick={() => handleUpdate(talent.id, newData)}>Update</button>
    </table>
  );
}
```

## What's Protected

The demo mode (`admin@metaagency.id`) restricts:
- ❌ Creating new records
- ❌ Updating existing records
- ❌ Deleting records
- ❌ Uploading files
- ❌ Changing settings

## What's Allowed

- ✅ Viewing all pages
- ✅ Viewing all data
- ✅ Opening modals/forms (but can't submit)
- ✅ Navigating the interface
- ✅ Sorting/filtering/searching

## Implementation Checklist

To protect a new admin page:

1. Import the hook: `import { useDemoMode } from '../contexts/DemoModeContext';`
2. Use the hook: `const { withDemoCheck } = useDemoMode();`
3. Wrap all modification actions: `const handleAction = withDemoCheck(async () => { ... });`
4. Test by logging in with `admin@metaagency.id` / `admin123`

## Examples

### ✅ Good - Protected
```jsx
const handleSave = withDemoCheck(async () => {
  await saveData();
});
```

### ❌ Bad - Not Protected
```jsx
const handleSave = async () => {
  await saveData(); // Will work in demo mode!
};
```

## Testing

1. Log in with `admin@metaagency.id` / `admin123`
2. You should see a blue banner at the top
3. Try to delete/edit/create something
4. You should see a toast notification saying it's read-only
5. Data should NOT be modified

## Customization

To change the demo admin email, edit `/src/utils/demoMode.js`:

```js
const DEMO_ADMIN_EMAIL = 'your-demo@email.com';
```

To customize the message, edit `/src/utils/demoMode.js`:

```js
export const getDemoModeMessage = () => {
  return 'Your custom message here';
};
```
