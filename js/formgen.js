/* Contact form + matching email template generator.
 * Follows the field-lock rules: only fields the user adds, no invented fields,
 * dropdown name/id must match the email template placeholder exactly.
 */

function fieldNameToLabel(name) {
  return (name || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function generateFormHTML(fields, opts) {
  const rows = fields
    .map((f) => {
      const label = f.label || fieldNameToLabel(f.name);
      if (f.type === "select") {
        const options = (f.options || [])
          .map((o) => `                <option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`)
          .join("\n");
        return `        <div class="form-group">
            <label for="${f.id}">${escapeHtml(label)}</label>
            <div class="select-container">
                <select class="select-hide" name="${f.name}" id="${f.id}"${f.required ? " required" : ""}>
                    <option value="">${escapeHtml(f.placeholder || "Please select")}</option>
${options}
                </select>
            </div>
        </div>`;
      }
      if (f.type === "textarea") {
        return `        <div class="form-group">
            <label for="${f.id}">${escapeHtml(label)}</label>
            <textarea class="form-control" name="${f.name}" id="${f.id}"${f.required ? " required" : ""}></textarea>
        </div>`;
      }
      return `        <div class="form-group">
            <label for="${f.id}">${escapeHtml(label)}</label>
            <input class="form-control" type="${f.type}" name="${f.name}" id="${f.id}"${f.required ? " required" : ""}>
        </div>`;
    })
    .join("\n");

  const hiddenDept = opts.departmentEnabled
    ? `        <input type="hidden" name="department" value="${escapeHtml(opts.departmentValue || "")}">\n`
    : "";

  const honeypot = `        <div style="position:absolute;left:-9999px;" aria-hidden="true">
            <label for="website">Leave this field blank</label>
            <input type="text" name="website" id="website" tabindex="-1" autocomplete="off">
        </div>\n`;

  return `<form method="post" action="">
${hiddenDept}${honeypot}${rows}
        <button type="submit" class="form-submit">${escapeHtml(opts.submitLabel || "Submit")}</button>
</form>`;
}

function generateEmailHTML(fields, opts) {
  const rows = fields
    .filter((f) => f.type !== "textarea" || f.includeInEmail !== false)
    .map((f) => {
      const label = f.label || fieldNameToLabel(f.name);
      return `<p><b>${escapeHtml(label)}:</b> {${f.name}}</p>`;
    })
    .join("\n");

  const emailField = fields.find((f) => f.type === "email");
  const contactBtn = emailField
    ? `\n<p style="margin: 20px 0 0 0;">
<a href="mailto:{${emailField.name}}" style="line-height: 2; color: #ffffff; text-decoration: none; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 25px; background-color: #348eda; margin: 0 10px 0 0; padding: 0; border-color: #348eda; border-style: solid; border-width: 10px 20px;">Contact Customer</a>
</p>`
    : "";

  return `<h3 style="margin: 0 0 20px; font-size: 22px; font-weight: 200; color: #000000;">Customer Information</h3>

${rows}
${contactBtn}`;
}
