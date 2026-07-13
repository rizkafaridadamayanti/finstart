const MONEY_WORDS =
  /\b(rp|rupiah|nominal|saldo|biaya|harga|nilai budget|nilai kontrak|target nilai|realisasi saat ini|gaji|lembur|tunjangan|bonus|kasbon|potongan|pph 21 manual)\b/i;
const NON_MONEY_WORDS =
  /\b(persen|persentase|tarif|porsi|faktor|masa manfaat|tahun|bulan|kurs)\b/i;

const integerDigits = (value) => {
  const text = String(value ?? "").trim();
  const withoutVisualDecimals = text.replace(/,00$/, "");
  return withoutVisualDecimals.replace(/\D/g, "");
};

export const parseRupiahInput = (value) => Number(integerDigits(value) || 0);

const formatRupiahInput = (value, withDecimals = true, withPrefix = true) => {
  const digits = integerDigits(value).replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  const prefix = withPrefix ? "Rp " : "";
  return `${prefix}${Number(digits).toLocaleString("id-ID")}${withDecimals ? ",00" : ""}`;
};

const fieldDescription = (input) => {
  const labelledBy = input.getAttribute("aria-labelledby");
  const ariaLabel = input.getAttribute("aria-label") || "";
  const linkedLabel = input.id
    ? document.querySelector(`label[for="${CSS.escape(input.id)}"]`)?.textContent
    : "";
  const enclosingLabel = input.closest("label")?.textContent || "";
  const nearbyText = input.parentElement?.textContent || "";
  const labelledText = labelledBy
    ? document.getElementById(labelledBy)?.textContent || ""
    : "";
  return `${ariaLabel} ${linkedLabel} ${enclosingLabel} ${labelledText} ${nearbyText}`
    .replace(/\s+/g, " ")
    .trim();
};

const isMoneyInput = (input) => {
  if (!(input instanceof HTMLInputElement)) return false;
  if (input.dataset.rupiah === "false") return false;
  if (input.dataset.rupiah === "true") return true;
  if (input.type !== "number") return false;
  const description = fieldDescription(input);
  return MONEY_WORDS.test(description) && !NON_MONEY_WORDS.test(description);
};

const displayFormattedValue = (input) => {
  input.value = formatRupiahInput(
    input.value,
    true,
    input.dataset.rupiahExternalPrefix !== "true",
  );
  input.setSelectionRange(input.value.length, input.value.length);
};

const prepareInput = (input) => {
  if (!isMoneyInput(input) || input.dataset.rupiahReady === "true") return;
  input.dataset.rupiahReady = "true";
  input.dataset.rupiah = "true";
  if (!input.dataset.rupiahExternalPrefix) {
    input.dataset.rupiahExternalPrefix = Array.from(
      input.parentElement?.children || [],
    ).some(
      (element) =>
        element !== input &&
        /^(rp|idr|usd|eur|sgd|jpy|aud|gbp)$/i.test(
          element.textContent?.trim() || "",
        ),
    )
      ? "true"
      : "false";
  }
  input.type = "text";
  input.inputMode = "numeric";
  input.autocomplete = "off";
  displayFormattedValue(input);
};

const prepareInputsInside = (root) => {
  if (root instanceof HTMLInputElement) prepareInput(root);
  root.querySelectorAll?.('input[type="number"], input[data-rupiah="true"]')
    .forEach(prepareInput);
};

export const installRupiahInputs = () => {
  const formatAfterHandler = (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.dataset.rupiahReady !== "true") return;
    input.value = integerDigits(input.value);
    queueMicrotask(() => {
      input.value = formatRupiahInput(
        input.value,
        false,
        input.dataset.rupiahExternalPrefix !== "true",
      );
      input.setSelectionRange(input.value.length, input.value.length);
    });
  };

  document.addEventListener("input", formatAfterHandler, true);
  document.addEventListener("change", formatAfterHandler, true);
  document.addEventListener(
    "focus",
    (event) => {
      const input = event.target;
      if (input instanceof HTMLInputElement && input.dataset.rupiahReady === "true") {
        input.value = formatRupiahInput(
          input.value,
          false,
          input.dataset.rupiahExternalPrefix !== "true",
        );
        input.setSelectionRange(input.value.length, input.value.length);
      }
    },
    true,
  );
  document.addEventListener(
    "blur",
    (event) => {
      const input = event.target;
      if (input instanceof HTMLInputElement && input.dataset.rupiahReady === "true") {
        displayFormattedValue(input);
      }
    },
    true,
  );

  prepareInputsInside(document);
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) prepareInputsInside(node);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
};
