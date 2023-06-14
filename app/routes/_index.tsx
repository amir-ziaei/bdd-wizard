import * as React from "react";
import type { V2_MetaFunction } from "@remix-run/node";
import { CheckIcon, ClipboardIcon } from "~/components/icons.tsx";
import { FitToContentTextArea } from "~/components/form-elements.tsx";

export const meta: V2_MetaFunction = () => [{ title: "BDD Wizard" }];

export const KEYWORDS = [
  "Given",
  "Only",
  "Then",
  "When",
  "And",
  "But",
] as const;

type Field = {
  id: string;
  keyword: (typeof KEYWORDS)[number];
  description: string;
};

export default function Index() {
  const [title, setTitle] = React.useState("");
  const [fields, setFields] = React.useState<Array<Field>>([
    {
      id: "1",
      keyword: "Given",
      description: "",
    },
  ]);
  const [isPreview, togglePreviewSwitch] = React.useReducer(
    (state) => !state,
    false
  );
  const [hasJustCopied, setHasJustCopied] = React.useState(false);

  const handleFieldChange = (field: Field) => {
    setFields((fields) => {
      const index = fields.findIndex((f) => f.id === field.id);
      if (index === -1) {
        return [...fields, field];
      }
      return [
        ...fields.slice(0, index),
        field,
        ...fields.slice(index + 1, fields.length),
      ];
    });
  };

  const addNewField = () => {
    setFields((fields) => [
      ...fields,
      {
        id: Math.random().toString(),
        keyword: "Given",
        description: "",
      },
    ]);
  };

  const copyToClipboard = () => {
    const text = `{panel:title=${title}}\n${fields
      .map((field) => `*${field.keyword}* ${field.description}`)
      .join("\n")}\n{panel}`;
    navigator.clipboard.writeText(text);
    setHasJustCopied(true);
  };

  React.useEffect(() => {
    if (!hasJustCopied) {
      return;
    }
    const timeout = setTimeout(() => {
      setHasJustCopied(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [hasJustCopied]);

  return (
    <main className="container">
      <div className="grid">
        <section>
          <form>
            <label htmlFor="title">
              Scenario title
              <input
                type="text"
                id="title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is the scenario about?"
              />
            </label>
            {fields.map((field, idx) => (
              <FieldInput
                key={field.id}
                value={field}
                onChange={handleFieldChange}
                index={idx}
              />
            ))}
          </form>
          <button onClick={addNewField}>Add a field</button>
        </section>
        <section>
          <label htmlFor="preview-switch">
            <input
              type="checkbox"
              id="preview-switch"
              role="switch"
              onChange={togglePreviewSwitch}
            />
            Preview
          </label>
          {isPreview ? (
            <article
              style={{
                margin: 0,
                paddingBottom: "calc(var(--block-spacing-vertical)*0.01)",
              }}
            >
              <header
                style={{
                  padding:
                    "calc(var(--block-spacing-vertical) * .2) var(--block-spacing-horizontal)",
                  marginBottom: "calc(var(--block-spacing-vertical) * .2)",
                }}
              >
                <b>{title ? title : "Title"}</b>
              </header>
              <p data-testid="preview-output">
                {fields.map((field) => (
                  <React.Fragment key={field.id}>
                    <strong>{field.keyword}</strong> {field.description}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </article>
          ) : (
            <pre style={{ position: "relative" }}>
              <code data-testid="jira-output">
                {`{panel:title=${title}}`}
                {fields.map((field) => (
                  <div key={field.id}>
                    *{field.keyword}* {field.description}
                  </div>
                ))}
                {`{panel}`}
              </code>
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  cursor: "pointer",
                }}
              >
                {hasJustCopied ? (
                  <CheckIcon />
                ) : (
                  <ClipboardIcon
                    aria-label="Copy"
                    role="button"
                    style={{
                      backgroundColor: "transparent",
                      padding: 0,
                      border: "none",
                    }}
                    onClick={copyToClipboard}
                  />
                )}
              </div>
            </pre>
          )}
        </section>
      </div>
    </main>
  );
}

function FieldInput({
  value,
  onChange,
  index,
}: {
  value: Field;
  onChange: (field: Field) => void;
  index: number;
}) {
  const selectRef = React.useRef<HTMLSelectElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleChange = () => {
    const keyword = selectRef.current?.value || "";
    const description = inputRef.current?.value || "";
    if (!isAllowedKeyword(keyword)) {
      return;
    }
    onChange({ ...value, keyword, description });
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: "1.25fr 4fr" }}>
      <select
        name="keywords"
        defaultValue={value.keyword}
        onChange={handleChange}
        ref={selectRef}
        aria-label={`Keyword of the field ${index + 1}`}
      >
        <option value="Given">Given</option>
        <option value="Only">Only</option>
        <option value="Then">Then</option>
        <option value="When">When</option>
        <option value="And">And</option>
        <option value="But">But</option>
      </select>
      <FitToContentTextArea
        ref={inputRef}
        defaultValue={value.description}
        name="description"
        onChange={handleChange}
        placeholder="Describe the condition"
        aria-label={`Description of the field ${index + 1}`}
        rows={1}
        style={{ resize: "none" }}
      ></FitToContentTextArea>
    </div>
  );
}

function isAllowedKeyword(keyword: string): keyword is Field["keyword"] {
  return KEYWORDS.includes(keyword as any);
}
