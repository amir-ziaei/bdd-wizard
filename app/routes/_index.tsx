import * as React from "react";
import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => [{ title: "BDD Wizard" }];

const KEYWORDS = ["Given", "Only", "Then", "When", "And", "But"] as const;

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
            {fields.map((field) => (
              <FieldInput
                key={field.id}
                value={field}
                onChange={handleFieldChange}
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
              <p>
                {fields.map((field) => (
                  <div key={field.id}>
                    <strong>{field.keyword}</strong> {field.description}
                  </div>
                ))}
              </p>
            </article>
          ) : (
            <pre style={{ position: "relative" }}>
              <code>
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
                  <ClipboardIcon onClick={copyToClipboard} />
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
}: {
  value: Field;
  onChange: (field: Field) => void;
}) {
  const selectRef = React.useRef<HTMLSelectElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
      >
        <option value="Given">Given</option>
        <option value="Only">Only</option>
        <option value="Then">Then</option>
        <option value="When">When</option>
        <option value="And">And</option>
        <option value="But">But</option>
      </select>
      <input
        defaultValue={value.description}
        type="text"
        name="description"
        onChange={handleChange}
        ref={inputRef}
        placeholder="Describe the condition"
      />
    </div>
  );
}

function isAllowedKeyword(keyword: string): keyword is Field["keyword"] {
  return KEYWORDS.includes(keyword as any);
}

function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
        stroke="#73828C"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H12H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
        stroke="#73828C"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g id="Interface / Check">
        <path
          id="Vector"
          d="M6 12L10.2426 16.2426L18.727 7.75732"
          stroke="#73828C"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  );
}
