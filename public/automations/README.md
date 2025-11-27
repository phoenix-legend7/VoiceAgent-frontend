# Automation Library Files

Place your Make.com blueprint JSON files in this directory.

## File Structure

Each automation file should be a valid Make.com blueprint JSON file. The file will be referenced by filename in the AutomationLibrary component.

## Example

To add a new automation:

1. Place the JSON file in this directory (e.g., `my-automation.json`)
2. Update the `AUTOMATIONS` array in `src/pages/AutomationLibrary.tsx`:

```typescript
{
  id: "my-automation",
  name: "My Automation",
  description: "Description of what this automation does",
  filename: "my-automation.json",
}
```

## Notes

- Filenames should match exactly between the file and the `AUTOMATIONS` array
- Files will be served from `/automations/[filename]` when the app is running

