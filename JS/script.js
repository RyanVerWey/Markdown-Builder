let sections = []; // Store sections as objects
let draggingIndex = null; // Track the index of the section being dragged

// Add a new section
function addSection(type) {
  const section = {
    type,
    content:
      type === "orderedList" ||
      type === "unorderedList" ||
      type === "checkbox" ||
      type === "blockQuote" ||
      type === "codeBlock"
        ? []
        : "",
    language: type === "codeBlock" ? "" : undefined, // Add language support for code blocks
  };
  sections.push(section);
  renderSections();
}

// Remove a section
function removeSection(index) {
  sections.splice(index, 1); // Remove the section from the array
  renderSections(); // Re-render the sections
}

function showNotification(message, type) {
  const notification = document.getElementById("notification");
  if (!notification) {
    console.error("Notification element not found.");
    return;
  }

  // Show the notification
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove("hidden");

  // Automatically hide after 3 seconds
  setTimeout(() => {
    notification.classList.add("hidden");
  }, 3000);
}

// Render sections dynamically
function renderSections() {
  const sectionsContainer = document.getElementById("sections");
  sectionsContainer.innerHTML = "";

  sections.forEach((section, index) => {
    const sectionDiv = document.createElement("div");
    sectionDiv.classList.add("section");
    sectionDiv.draggable = true;
    sectionDiv.dataset.index = index;
    sectionDiv.id = `section-${index}`; // Assign a unique ID for navigation

    // Drag and drop handlers
    sectionDiv.addEventListener("dragstart", () => (draggingIndex = index));
    sectionDiv.addEventListener("dragover", (e) => e.preventDefault());
    sectionDiv.addEventListener("drop", () => {
      if (draggingIndex !== null && draggingIndex !== index) {
        const dragged = sections.splice(draggingIndex, 1)[0];
        sections.splice(index, 0, dragged);
        draggingIndex = null;
        renderSections();
      }
    });

    // Section content
    sectionDiv.innerHTML = `
            <label class="section-label">${getSectionLabel(
              section.type
            )}</label>
            ${generateSectionContent(section, index)}
        `;
    sectionsContainer.appendChild(sectionDiv);
  });

  renderNavigation();
}

// Helper function to format anchor tags
function formatAnchorName(text) {
  if (typeof text !== "string") {
    return "untitled-header"; // Default anchor name for non-string inputs
  }
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-"); // Replace spaces with dashes
}

// Render navigation dynamically
function renderNavigation() {
  let navigationContainer = document.getElementById("navigation");

  // If the navigation container doesn't exist, create it
  if (!navigationContainer) {
    navigationContainer = document.createElement("div");
    navigationContainer.id = "navigation";
    navigationContainer.classList.add("section");

    const sectionsContainer = document.getElementById("sections");
    sectionsContainer.prepend(navigationContainer);
  }

  // Collect only header2 titles for navigation
  const headers = sections
    .map((section, index) => {
      if (section.type === "header2") {
        const anchorName = formatAnchorName(
          section.content || "untitled-header"
        );
        return `<a href="#${anchorName}">${
          section.content || "Untitled Header"
        }</a>`;
      }
      return null;
    })
    .filter(Boolean) // Remove null values
    .join("<br>");

  navigationContainer.innerHTML = `
        <h3>Navigation</h3>
        <div>${headers}</div>
    `;
}

// Get a user-friendly label for the section type
function getSectionLabel(type) {
  switch (type) {
    case "header1":
      return "New Section";
    case "header2":
      return "Header ##";
    case "header3":
      return "Header ###";
    case "header4":
      return "Header ####";
    case "header5":
      return "Header #####";
    case "header6":
      return "Header ######";
    case "text":
      return "Text Block";
    case "unorderedList":
      return "Unordered List";
    case "orderedList":
      return "Ordered List";
    case "checkbox":
      return "Checkbox Section";
    case "image":
      return "Image";
    case "url":
      return "URL";
    case "blockQuote":
      return "Block Quote";
    case "codeBlock":
      return "Code Block";
    case "lineBreak":
      return "Line Break";
    case "horizontalRule":
      return "Horizontal Rule";
    default:
      return "Unknown Section";
  }
}

// Generate section content
function generateSectionContent(section, index) {
  const deleteOnlyToolbar = `
        <div class="toolbar-controls">
            <button type="button" class="remove-button" title="Remove Section" onclick="removeSection(${index})">❌</button>
        </div>
    `;

  const textToolbar = `
        <div class="toolbar-controls">
            <button type="button" title="Bold" onclick="applyFormatting(${index}, '**')"><b>B</b></button>
            <button type="button" title="Italic" onclick="applyFormatting(${index}, '*')"><i>I</i></button>
            <button type="button" title="Bold Italic" onclick="applyFormatting(${index}, '***')"><b><i>BI</i></b></button>
            <button type="button" title="Inline Code" onclick="applyFormatting(${index}, '\`')"><code>&lt;/&gt;</code></button>
            <button type="button" class="remove-button" title="Remove Section" onclick="removeSection(${index})">❌</button>
        </div>
    `;

  switch (section.type) {
    case "text":
      return `${textToolbar}${generateSectionBody(section, index)}`;
    case "unorderedList":
    case "orderedList":
    case "codeBlock":
    default:
      return `${deleteOnlyToolbar}${generateSectionBody(section, index)}`;
  }
}

// Generate section body
function generateSectionBody(section, index) {
  switch (section.type) {
    case "header1":
    case "header2":
    case "header3":
    case "header4":
    case "header5":
    case "header6":
      return `
                <input type="text" 
                       placeholder="Header text" 
                       oninput="updateSection(${index}, this.value)" 
                       onblur="renderNavigation()" 
                       value="${section.content}" 
                       style="width: 100%;">
            `;
    case "text":
      return `
                <textarea placeholder="Text content" 
                          oninput="updateSection(${index}, this.value)" 
                          style="width: 100%; height: 80px;">${section.content}</textarea>
            `;
    case "unorderedList":
    case "orderedList":
      return `
                <textarea placeholder="One Item per line" 
                          oninput="updateSection(${index}, this.value.split('\\n'))" 
                          style="width: 100%; height: 80px;">${section.content.join(
                            "\n"
                          )}</textarea>
            `;
    case "codeBlock":
      return `
                <input type="text" 
                       placeholder="Enter language (e.g., javascript, python)" 
                       onblur="validateLanguage(${index}, this.value)" 
                       value="${section.language || ""}" 
                       style="width: 100%; margin-bottom: 10px;">
                <textarea placeholder="Enter code content" 
                          oninput="updateSection(${index}, this.value.split('\\n'))" 
                          style="width: 100%; height: 120px; font-family: monospace;">${section.content.join(
                            "\n"
                          )}</textarea>
            `;
    case "lineBreak":
      return `<div style="text-align: center; color: #999;">[ Line Break ]</div>`;
    case "horizontalRule":
      return `<div style="text-align: center; color: #999;">[ Horizontal Rule ]</div>`;
    default:
      return `
                <textarea placeholder="Content" 
                          oninput="updateSection(${index}, this.value)" 
                          style="width: 100%; height: 80px;">${section.content}</textarea>
            `;
  }
}

// Update section content
function updateSection(index, value, key) {
  if (key) {
    if (!sections[index].content) sections[index].content = {};
    sections[index].content[key] = value;
  } else if (Array.isArray(value)) {
    sections[index].content = value;
  } else {
    sections[index].content = value;
  }
}

// Apply formatting
function applyFormatting(index, syntax) {
  const section = sections[index];
  if (!section || section.type !== "text") {
    alert("Formatting can only be applied to text blocks.");
    return;
  }

  const sectionDiv = document.querySelector(`#section-${index}`);
  const textarea = sectionDiv ? sectionDiv.querySelector("textarea") : null;

  if (!textarea) {
    console.error(`Textarea for section ${index} not found.`);
    return;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const formattedText = `${syntax}${selectedText}${syntax}`;
  sections[index].content =
    textarea.value.substring(0, start) +
    formattedText +
    textarea.value.substring(end);

  textarea.value = sections[index].content;
  textarea.dispatchEvent(new Event("input"));
}

// Validate code block language
function validateLanguage(index, language) {
  const supportedLanguages = [
    "javascript",
    "python",
    "java",
    "c",
    "c++",
    "c#",
    "ruby",
    "go",
    "php",
    "typescript",
    "swift",
    "html",
    "css",
    "kotlin",
    "r",
    "bash",
    "shell",
    "sql",
    "perl",
    "rust",
    "dart",
    "scala",
    "lua",
    "powershell",
    "json",
    "yaml",
    "xml",
    "matlab",
    "groovy",
    "pascal",
    "haskell",
    "fortran",
    "objective-c",
    "visualbasic",
    "vb.net",
    "abap",
    "scheme",
    "elixir",
    "f#",
    "assembly",
    "clojure",
    "cobol",
    "d",
    "erlang",
    "nim",
    "ocaml",
    "pl/sql",
    "sas",
    "ada",
    "awk",
    "julia",
    "prolog",
    "racket",
    "smalltalk",
    "tcl",
    "verilog",
    "vhdl",
    "vbscript",
  ];

  if (sections[index].type === "codeBlock") {
    const trimmedLanguage = language.trim().toLowerCase();

    if (trimmedLanguage) {
      if (supportedLanguages.includes(trimmedLanguage)) {
        sections[index].language = trimmedLanguage; // Save valid language
      } else {
        alert(
          `"${language}" is not a recognized programming language. 
Please enter one of the following supported languages: 
${supportedLanguages.join(", ")}`
        );
        sections[index].language = ""; // Reset invalid language
      }
    } else {
      alert("Please specify a programming language for the code block.");
      sections[index].language = ""; // Reset empty language
    }
  }
}

// Generate Markdown
function generateMarkdown() {
  try {
    // Ensure navigation is updated before generating Markdown
    renderNavigation();

    // Generate the navigation Markdown (only for header2 sections)
    const navigationMarkdown = sections
      .map((section, index) => {
        if (section.type === "header2") {
          const anchorName = formatAnchorName(
            section.content || "untitled-header"
          );
          return `- [${section.content || "Untitled Header"}](#${anchorName})`;
        }
        return null;
      })
      .filter(Boolean)
      .join("\n");

    // Generate the sections' content Markdown
    const contentMarkdown = sections
      .map((section) => {
        const anchorName = formatAnchorName(
          section.content || "untitled-header"
        );
        switch (section.type) {
          case "header1":
            return `# ${section.content}`;
          case "header2":
            return `## ${section.content}`;
          case "header3":
            return `### ${section.content}`;
          case "header4":
            return `#### ${section.content}`;
          case "header5":
            return `##### ${section.content}`;
          case "header6":
            return `###### ${section.content}`;
          case "text":
            return section.content || "";
          case "unorderedList":
            return (section.content || [])
              .map((item) => `- ${item}`)
              .join("\n");
          case "orderedList":
            return (section.content || [])
              .map((item, i) => `${i + 1}. ${item}`)
              .join("\n");
          case "checkbox":
            return (section.content || [])
              .map((item) => `- [ ] ${item}`)
              .join("\n");
          case "blockQuote":
            return (section.content || [])
              .map((item) => `> ${item}`)
              .join("\n");
          case "codeBlock": {
            const codeLanguage = section.language
              ? `\`\`\`${section.language}`
              : "```";
            const codeContent = Array.isArray(section.content)
              ? section.content.join("\n")
              : section.content || "";
            return `${codeLanguage}\n${codeContent}\n\`\`\``;
          }
          case "lineBreak":
            return `<br>`;
          case "horizontalRule":
            return `---`;
          case "image":
            return `![Image](${section.content})`;
          case "url":
            return `[${section.content.text || "Link"}](${
              section.content.url || ""
            })`;
          default:
            return "";
        }
      })
      .join("\n\n");

    // Combine navigation and sections' Markdown
    const fullMarkdown = `# Navigation\n\n${navigationMarkdown}\n\n${contentMarkdown}`;

    // Update the preview pane with the generated Markdown
    document.getElementById("preview").textContent = fullMarkdown;

    // Show notification when Markdown is generated
    showNotification("Markdown successfully generated!", "success");
  } catch (error) {
    console.error("Error generating Markdown:", error);
    showNotification("An error occurred while generating Markdown.", "error");
  }
}

// Copy Markdown
function copyMarkdown() {
  const markdown = document.getElementById("preview").textContent;
  if (!markdown) {
    showNotification("No Markdown to copy!", "error");
    return;
  }

  navigator.clipboard
    .writeText(markdown)
    .then(() => showNotification("Markdown copied to clipboard!", "success"))
    .catch((err) => {
      console.error("Error copying to clipboard:", err);
      showNotification("Failed to copy Markdown to clipboard!", "error");
    });
}

// Ensure Event Listener Only on Click
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded."); // Debugging log

  const copyButton = document.getElementById("copyButton");
  if (copyButton) {
    // Add event listener to the Copy button
    copyButton.addEventListener("click", copyMarkdown);
  }
});

// Download Markdown
function downloadMarkdown() {
  const markdown = document.getElementById("preview").textContent;
  if (!markdown) {
    alert("No Markdown to download!");
    return;
  }
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "markdown.md";
  a.click();
  URL.revokeObjectURL(url);
}
