const TemplateEditor: FC<TemplateEditorProps> = ({
  elements,
  onElementChange,
  onSave,
  onCancel,
}): ReactElement => {
  const handleChange = useCallback(
    (el: TemplateElement) =>
      (
        event: ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        let value: string | number | null = event.target.value;
        if (el.type === 'number') {
          const num = parseFloat(value);
          value = isNaN(num) ? null : num;
        }
        onElementChange(el.id, value);
      },
    [onElementChange]
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      onSave();
    },
    [onSave]
  );

  return (
    <div className="template-editor">
      <form className="editor-form" onSubmit={handleSubmit}>
        {elements.map((el) => {
          const commonProps = {
            id: el.id,
            onChange: handleChange(el),
          };
          switch (el.type) {
            case 'color':
              return (
                <div key={el.id} className="form-group">
                  <label htmlFor={el.id}>{el.label}</label>
                  <input
                    {...commonProps}
                    type="color"
                    value={(el.value as string) || '#000000'}
                  />
                </div>
              );
            case 'text':
            case 'url':
              return (
                <div key={el.id} className="form-group">
                  <label htmlFor={el.id}>{el.label}</label>
                  <input
                    {...commonProps}
                    type={el.type}
                    value={(el.value as string) || ''}
                  />
                </div>
              );
            case 'textarea':
              return (
                <div key={el.id} className="form-group">
                  <label htmlFor={el.id}>{el.label}</label>
                  <textarea
                    {...commonProps}
                    value={(el.value as string) || ''}
                  />
                </div>
              );
            case 'number':
              return (
                <div key={el.id} className="form-group">
                  <label htmlFor={el.id}>{el.label}</label>
                  <input
                    {...commonProps}
                    type="number"
                    value={
                      el.value !== null && el.value !== undefined
                        ? String(el.value)
                        : ''
                    }
                  />
                </div>
              );
            case 'select':
              const fallbackValue =
                el.value !== undefined && el.value !== null
                  ? String(el.value)
                  : el.options && el.options.length > 0
                  ? el.options[0].value
                  : '';
              return (
                <div key={el.id} className="form-group">
                  <label htmlFor={el.id}>{el.label}</label>
                  <select {...commonProps} value={fallbackValue}>
                    {el.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            default:
              return null;
          }
        })}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-save">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateEditor;