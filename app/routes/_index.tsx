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
    <>
      <nav className="container-fluid">
        <ul>
          <li>
            <h1
              style={{
                fontSize: "1.25rem",
                marginBottom: 0,
              }}
            >
              BDD Wizard
            </h1>
          </li>
        </ul>
        <ul>
          <li>
            <a
              href="https://github.com/amir-ziaei/bddwizard.com/issues/new"
              className="secondary"
            >
              Report a bug
            </a>
          </li>
          <li>
            <a
              href="https://github.com/amir-ziaei/bddwizard.com"
              className="contrast"
              aria-label="BDDWizard's GitHub repository"
            >
              <svg
                height="32"
                aria-hidden="true"
                viewBox="0 0 16 16"
                version="1.1"
                width="32"
                data-view-component="true"
              >
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
            </a>
          </li>
        </ul>
      </nav>
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
    </>
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
