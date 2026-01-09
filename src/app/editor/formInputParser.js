const normalizeText = (value) => {
  if (!value) return "";
  return String(value).replace(/\s+/g, " ").trim();
};

const sanitizeLabel = (value) => {
  const cleaned = String(value || "").replace(/[^A-Za-z0-9 ]+/g, " ");
  return normalizeText(cleaned);
};

const escapeAttributeValue = (value) =>
  String(value).replace(/"/g, '\\"');

const getCssEscape = () => {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape;
  }
  return (value) => String(value).replace(/([ #;?%&,.+*~':"!^$[\]()=>|/@])/g, "\\$1");
};

const getLabelText = (element, doc) => {
  if (!element || !doc) return "";

  const ariaLabel = normalizeText(element.getAttribute("aria-label"));
  if (ariaLabel) return ariaLabel;

  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const ids = labelledBy.split(/\s+/).filter(Boolean);
    for (const id of ids) {
      const labelTarget = doc.getElementById(id);
      const labelText = normalizeText(labelTarget?.textContent);
      if (labelText) return labelText;
    }
  }

  const id = element.getAttribute("id");
  if (id) {
    const escape = getCssEscape();
    const label = doc.querySelector(`label[for="${escape(id)}"]`);
    const labelText = normalizeText(label?.textContent);
    if (labelText) return labelText;
  }

  const parentLabel = element.closest("label");
  const parentLabelText = normalizeText(parentLabel?.textContent);
  if (parentLabelText) return parentLabelText;

  const fieldset = element.closest("fieldset");
  const legendText = normalizeText(fieldset?.querySelector("legend")?.textContent);
  if (legendText) return legendText;

  const previousLabel = element.previousElementSibling;
  if (previousLabel?.tagName?.toLowerCase() === "label") {
    const prevText = normalizeText(previousLabel.textContent);
    if (prevText) return prevText;
  }

  const parent = element.parentElement;
  if (parent) {
    const siblingLabel = parent.querySelector("label");
    const siblingText = normalizeText(siblingLabel?.textContent);
    if (siblingText) return siblingText;
  }

  return "";
};

const buildSelector = (element) => {
  if (!element) return "";
  const tag = element.tagName.toLowerCase();
  const id = element.getAttribute("id");
  if (id) {
    const escape = getCssEscape();
    return `#${escape(id)}`;
  }
  const name = element.getAttribute("name");
  if (name) {
    return `${tag}[name="${escapeAttributeValue(name)}"]`;
  }
  if (tag === "input" || tag === "button") {
    const type = element.getAttribute("type");
    if (type) {
      return `${tag}[type="${escapeAttributeValue(type)}"]`;
    }
  }
  return tag;
};

const inputKindFromElement = (element) => {
  const tag = element.tagName.toLowerCase();
  if (tag === "select") return "select";
  if (tag === "textarea") return "text";
  if (tag === "input") {
    const type = (element.getAttribute("type") || "text").toLowerCase();
    if (type === "number") return "number";
    if (type === "date") return "date";
    if (type === "checkbox") return "checkbox";
    if (type === "radio") return "radio";
    return "text";
  }
  return "text";
};

const baseStepFields = {
  scopeSelector: "",
  inputKind: "text",
  dateFormat: "",
  value: "",
  label: "",
  waitMs: "",
  url: "",
};

export const parseFormHtmlToSteps = (formHtml) => {
  const source = typeof formHtml === "string" ? formHtml.trim() : "";
  if (!source) {
    return { steps: [], error: "Form HTML is empty." };
  }
  if (typeof DOMParser === "undefined") {
    return { steps: [], error: "Form parser is not available." };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(source, "text/html");
  const roots = Array.from(doc.querySelectorAll("form"));
  const containers = roots.length ? roots : [doc.body];
  const steps = [];
  const submitButtons = [];

  containers.forEach((container) => {
    const inputs = Array.from(
      container.querySelectorAll("input, select, textarea")
    );
    const handledRadioNames = new Set();

    inputs.forEach((element) => {
      const tag = element.tagName.toLowerCase();
      if (tag === "input") {
        const type = (element.getAttribute("type") || "text").toLowerCase();
        if (
          type === "hidden" ||
          type === "submit" ||
          type === "button" ||
          type === "reset"
        ) {
          return;
        }
        if (type === "radio") {
          const name = element.getAttribute("name") || "";
          const radioKey = name || element.getAttribute("id") || "";
          if (radioKey && handledRadioNames.has(radioKey)) {
            return;
          }
          if (radioKey) {
            handledRadioNames.add(radioKey);
          }
          const fieldset = element.closest("fieldset");
          const legendText = normalizeText(
            fieldset?.querySelector("legend")?.textContent
          );
          const label = sanitizeLabel(
            legendText ||
              normalizeText(element.getAttribute("name")) ||
              getLabelText(element, doc) ||
              "Form Input"
          );
          const scopeSelector = name
            ? `input[type="radio"][name="${escapeAttributeValue(name)}"]`
            : buildSelector(element);
          steps.push({
            ...baseStepFields,
            title: `Fill ${label}`,
            description: "Auto from form HTML",
            type: "Input",
            label,
            inputKind: "radio",
            scopeSelector,
          });
          return;
        }
      }

      const label =
        getLabelText(element, doc) ||
        normalizeText(element.getAttribute("placeholder")) ||
        normalizeText(element.getAttribute("name")) ||
        "Form Input";
      const safeLabel = sanitizeLabel(label);
      const inputKind = inputKindFromElement(element);
      const scopeSelector = buildSelector(element);

      steps.push({
        ...baseStepFields,
        title: `Fill ${safeLabel}`,
        description: "Auto from form HTML",
        type: "Input",
        label: safeLabel,
        inputKind,
        scopeSelector,
      });
    });

    const submitElements = Array.from(
      container.querySelectorAll('input[type="submit"], button[type="submit"]')
    );
    submitButtons.push(...submitElements);
  });

  submitButtons.forEach((element) => {
    const text =
      normalizeText(element.getAttribute("value")) ||
      normalizeText(element.textContent) ||
      "Submit";
    const safeText = sanitizeLabel(text);
    steps.push({
      ...baseStepFields,
      title: `Click ${safeText}`,
      description: "Auto from form HTML",
      type: "Click",
      label: safeText,
      scopeSelector: buildSelector(element),
    });
  });

  return { steps, error: "" };
};
