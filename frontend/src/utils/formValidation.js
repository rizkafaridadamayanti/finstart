const CONTROL_SELECTOR = "input, select, textarea";

function fieldName(control) {
  const id = control.id;
  const explicitLabel = id
    ? control.form?.querySelector(`label[for="${CSS.escape(id)}"]`)
    : null;
  const wrappingLabel = control.closest("label");
  const nearbyLabel = control.parentElement?.querySelector("label");
  const text =
    explicitLabel?.textContent ||
    wrappingLabel?.textContent ||
    nearbyLabel?.textContent ||
    control.getAttribute("aria-label") ||
    control.getAttribute("placeholder") ||
    control.getAttribute("name") ||
    "Kolom ini";

  return text.replace(/\s+/g, " ").replace(/[*:]+$/g, "").trim();
}

function validationMessage(control) {
  const name = fieldName(control);
  const validity = control.validity;

  if (validity.valueMissing) return `${name} wajib diisi.`;
  if (validity.typeMismatch && control.type === "email") {
    return `${name} harus menggunakan format email yang valid.`;
  }
  if (validity.typeMismatch) return `Format ${name} belum valid.`;
  if (validity.tooShort) {
    return `${name} minimal ${control.minLength} karakter.`;
  }
  if (validity.tooLong) {
    return `${name} maksimal ${control.maxLength} karakter.`;
  }
  if (validity.rangeUnderflow) {
    return `${name} tidak boleh kurang dari ${control.min}.`;
  }
  if (validity.rangeOverflow) {
    return `${name} tidak boleh lebih dari ${control.max}.`;
  }
  if (validity.stepMismatch) return `${name} memiliki nilai yang tidak sesuai.`;
  if (validity.patternMismatch) return `Format ${name} belum sesuai.`;
  if (validity.badInput) return `${name} berisi nilai yang tidak dapat diproses.`;
  return `${name} belum valid. Periksa kembali nilai yang dimasukkan.`;
}

function errorId(control) {
  if (!control.dataset.validationId) {
    control.dataset.validationId = `field-error-${crypto.randomUUID()}`;
  }
  return control.dataset.validationId;
}

function clearFieldError(control) {
  const id = control.dataset.validationId;
  if (id) document.getElementById(id)?.remove();
  control.classList.remove("form-control-invalid");
  control.removeAttribute("aria-invalid");
  control.removeAttribute("aria-describedby");
}

function showFieldError(control) {
  clearFieldError(control);
  const id = errorId(control);
  const message = document.createElement("p");
  message.id = id;
  message.classList.add("form-field-warning");
  message.setAttribute("role", "alert");
  message.textContent = validationMessage(control);
  control.classList.add("form-control-invalid");
  control.setAttribute("aria-invalid", "true");
  control.setAttribute("aria-describedby", id);
  control.insertAdjacentElement("afterend", message);
}

function showFormSummary(form, controls) {
  form.querySelector(":scope > .form-validation-summary")?.remove();
  if (!controls.length) return;

  const summary = document.createElement("div");
  summary.classList.add("form-validation-summary");
  summary.setAttribute("role", "alert");
  summary.innerHTML = `<strong>Form belum dapat disimpan.</strong><span>Periksa ${controls.length} kolom yang ditandai di bawah ini.</span>`;
  form.prepend(summary);
}

function usesManualValidation(form) {
  return form?.noValidate || form?.dataset?.manualValidation === "true";
}

export function installGlobalFormValidation() {
  document.addEventListener(
    "invalid",
    (event) => {
      const control = event.target;
      if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) return;
      if (usesManualValidation(control.form)) return;
      event.preventDefault();
      showFieldError(control);
      const form = control.form;
      if (form && !form.dataset.validationSummaryQueued) {
        form.dataset.validationSummaryQueued = "true";
        requestAnimationFrame(() => {
          delete form.dataset.validationSummaryQueued;
          const invalidControls = [...form.querySelectorAll(CONTROL_SELECTOR)].filter(
            (item) => !item.disabled && !item.validity.valid,
          );
          invalidControls.forEach(showFieldError);
          showFormSummary(form, invalidControls);
          invalidControls[0]?.focus({ preventScroll: true });
          invalidControls[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    },
    true,
  );

  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (usesManualValidation(form)) return;
      const invalidControls = [...form.querySelectorAll(CONTROL_SELECTOR)].filter(
        (control) => !control.disabled && !control.validity.valid,
      );
      if (!invalidControls.length) {
        form.querySelector(":scope > .form-validation-summary")?.remove();
        return;
      }

      event.preventDefault();
      invalidControls.forEach(showFieldError);
      showFormSummary(form, invalidControls);
      requestAnimationFrame(() => {
        invalidControls[0].focus({ preventScroll: true });
        invalidControls[0].scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
    true,
  );

  const clear = (event) => {
    const control = event.target;
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) return;
    if (control.validity.valid) clearFieldError(control);
  };
  document.addEventListener("input", clear, true);
  document.addEventListener("change", clear, true);
}
