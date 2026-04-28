document.addEventListener("DOMContentLoaded", () => {

// Get the questionnaire container
const container = document.getElementById("questionnaire");

// Get buttons
const SubmitBtn = document.getElementById("Submit");
const DownloadBtn = document.getElementById("Download");

// ---------------------------------------------------------
// Questionniare Radio 
//----------------------------------------------------------
// Only run if the questionnaire exists
if (container) {

  // Listen to any radio button change inside the questionnaire
  container.addEventListener("change", (e) => {

    // Ignore anything that isnt a radio button
    if (e.target.type !== "radio") return;
    // Find the question card containing the radio button
    const card = e.target.closest(".question-card");
    const result = card.querySelector(".result");

    // Show selected answer to the user
    const labelText = e.target.parentElement.innerText.trim();
    result.textContent = "Selected: " + labelText;
  });
}

//----------------------------------------------------------
// Button Event Listeners
//----------------------------------------------------------
// Only attach if the Submit button exists
if (SubmitBtn) {
  SubmitBtn.addEventListener("click", calculateScore);
}
// Only attach if Download button exists
if (DownloadBtn) {
  DownloadBtn.addEventListener("click", generatePDF);
}

//----------------------------------------------------------
// Calculate Security Risk Score
//----------------------------------------------------------
function calculateScore() {
  // Get all questions
  const questions = document.querySelectorAll("#questionnaire .question-card");

  let totalPoints = 0;
  let maxPoints = 0;
  // Loop through each question
  questions.forEach(question => {
    // Get selected radio button
    const selected = question.querySelector("input[type='radio']:checked");

// If box is left unchecked it counts as maximum score
const score = selected
  ? parseInt(selected.getAttribute("score")) || 0
  : 5; // treat unanswered as maximum risk
totalPoints += score;
maxPoints += 5;
  });

  // Prevent divide by zero
  if (maxPoints === 0) {
    alert("Please answer at least one question.");
    return;
  }
  // Calculate percentage risk score
  const riskScore = Math.round((totalPoints / maxPoints) * 100);
  let riskLevel;
  
  // Assign risk level based on percentage
  if (riskScore <= 33)
    riskLevel = "LOW RISK";

  else if (riskScore <= 66)
    riskLevel = "MEDIUM RISK";

  else
    riskLevel = "HIGH RISK";

  // Save results in browser storage
  localStorage.setItem("riskScore", riskScore);
  localStorage.setItem("riskLevel", riskLevel);

  // Redirect to results page
  window.location.href = "results.html";
}

//---------------------------------------------------------
// Generate Questionnaire PDF
//---------------------------------------------------------
function generatePDF() {

  // Load jsPDF library
  const { jsPDF } = window.jspdf;
  // Create new PDF document
  const doc = new jsPDF();

  // Get all question cards
  const cards = document.querySelectorAll(".question-card");
  let y = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("Security Risk Assessment Report", 20, y);

  y += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, "normal");

  cards.forEach((card, index) => {
    const question =
      card.querySelector(".question").textContent.trim();
    const selected =
      card.querySelector("input:checked");
    const answer = selected
      ? selected.parentElement.innerText.trim()
      : "Not answered";

    // Question 
    doc.setFont(undefined, "bold");
    const questionLines =
      doc.splitTextToSize(question, 170);
    doc.text(questionLines, 20, y);
    y += questionLines.length * 6;

    // Answer (
    doc.setFont(undefined, "normal");
    doc.text("Answer: " + answer, 25, y);
    y += 10;

    // Spacing between questions
    y += 4;

    // New page if needed
    if (y > 270) {
      doc.addPage();
      y = 20;

    }
  });

  // Save PDF file
  doc.save("Security_Assessment_Report.pdf");
}

//-----------------------------------------
// Generate Incident Report PDF
// ----------------------------------------
function generateReportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  // Add report title
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text(document.title, 20, y);

  y += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, "normal");

  // Get all report fields
  const inputs = document.querySelectorAll(
    ".report-input, .report-textarea, .report-select"
  );

  // Loop through each input
  inputs.forEach(input => {
    const label =
      input.previousElementSibling?.innerText || "Field";
    const value =
      input.value || "Not provided";
    const text = label + ": " + value;
    const lines =
      doc.splitTextToSize(text, 170);
    doc.text(lines, 20, y);

    y += lines.length * 6;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  // Handle checkboxes
  const checkboxes =
    document.querySelectorAll(
      ".report-checkbox-group input:checked"
    );

  // Check if a checkbox is selected
  if (checkboxes.length > 0) {
    //Vertical spacing
    y += 10;
    doc.setFont(undefined, "bold");
    doc.text("Selected Options:", 20, y);
    y += 8;
    doc.setFont(undefined, "normal");
    // Loop through each selected checkbox
    checkboxes.forEach(box => {
      // Get the label text off the checkbox and remove whitespace
      const label =
        box.parentElement.innerText.trim();
      doc.text("- " + label, 25, y);
      y += 6;

    });
  }

  // Create filename from page title
  const filename =
    document.title.replace(/\s+/g, "_") + ".pdf";
  doc.save(filename);
}

//---------------------------------------------------------
// 24-Hour and 72-Hour Reports
//---------------------------------------------------------
async function generateReportPDF() {

  const { jsPDF } = window.jspdf;

  // Select the full report card
  const element = document.querySelector(".report-card");

  // Capture it as image
  const canvas = await html2canvas(element, { scale: 2 });

  const img = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const width = 210;
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(img, "PNG", 0, 0, width, height);

  pdf.save(document.title.replace(/\s+/g, "_") + ".pdf");
}

// ================================
// RESULTS PAGE DISPLAY
// ================================

const scoreElement = document.getElementById("score");
const riskElement = document.getElementById("risk");

if (scoreElement && riskElement) {
  const score = localStorage.getItem("riskScore");
  const level = localStorage.getItem("riskLevel");

  if (score && level) {
    scoreElement.innerText = "Score: " + score + "/100";
    riskElement.innerText = "Risk Level: " + level;

  } else {
    scoreElement.innerText = "No score available";
    riskElement.innerText = "";
  }
}

// Make back button work
window.goBack = function () {
  window.location.href = "index.html";
};

//------------------------------------------------------------------
// Report Submit Button Handler
//------------------------------------------------------------------
// Get report submit button
const reportSubmitBtn = document.getElementById("report-submit");

// Only attach event if button exists
if (reportSubmitBtn) {
  reportSubmitBtn.addEventListener("click", generateReportPDF);
}
});

//-------------------------------------------------------------------
// Incident Response Runbook
//-------------------------------------------------------------------
const runbookBtn = document.getElementById("runbook-submit");

if (runbookBtn) {
  runbookBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const element = document.querySelector(".policy-card");

    const canvas = await html2canvas(element, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p","mm","a4");
    const width = 210;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(img,"PNG",0,0,width,height);
    pdf.save("Incident_Runbook.pdf");
});

}


//---------------------------------------------------------
// Share via Email
//---------------------------------------------------------
const shareBtn = document.getElementById("shareEmail");

if (shareBtn) {
  shareBtn.addEventListener("click", () => {

  let content = "";

    // -------- QUESTIONNAIRE --------
    const questionnaire = document.getElementById("questionnaire");

if (questionnaire) {
  const questions = questionnaire.querySelectorAll(".question-card");

  questions.forEach((q, index) => {
    const question = q.querySelector(".question")?.innerText || "";
    const selected = q.querySelector("input:checked");
    const answer = selected
      ? selected.parentElement.innerText.trim()
      : "Not answered";

    content += `${index + 1}. ${question}\nAnswer: ${answer}\n\n`;
  });
}


    // -------- REPORTS --------
    const inputs = document.querySelectorAll(
      ".report-input, .report-textarea, .report-select"
    );

    if (inputs.length > 0) {
      inputs.forEach(input => {
        const label = input.previousElementSibling?.innerText || "Field";
        const value = input.value || "Not provided";

        content += `${label}: ${value}\n\n`;
      });

      // Checkboxes
      const checkboxes = document.querySelectorAll(
        ".report-checkbox-group input:checked"
      );

      if (checkboxes.length > 0) {
        content += "Selected Options:\n";
        checkboxes.forEach(box => {
          content += "- " + box.parentElement.innerText.trim() + "\n";
        });
      }
    }

    // -------- EMAIL LINK --------
    const subject = encodeURIComponent("Security Report / Questionnaire");
    const body = encodeURIComponent(content);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  });
}

//---------------------------------------------------------
// Share Results 
//---------------------------------------------------------
const shareResultsBtn = document.getElementById("shareResults");

if (shareResultsBtn) {
  shareResultsBtn.addEventListener("click", () => {

    const score = localStorage.getItem("riskScore");
    const level = localStorage.getItem("riskLevel");

    let content = "Security Risk Results\n\n";

    if (score && level) {
      content += "Score: " + score + "/100\n";
      content += "Risk Level: " + level + "\n\n";
    } else {
      content += "No results available\n";
    }

    const subject = encodeURIComponent("Security Risk Results");
    const body = encodeURIComponent(content);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  });
}

//---------------------------------------------------------
// Share Runbook
//---------------------------------------------------------
const shareRunbookBtn = document.getElementById("shareRunbook");

if (shareRunbookBtn) {
  shareRunbookBtn.addEventListener("click", () => {

    const pageTitle = document.title;
    const cleanTitle = pageTitle.replace("Security Incident Management Runbook: ", "");

    let content = "Incident Response Runbook\n\n";
    content += "Runbook Type: " + cleanTitle + "\n\n";

    // -------- GET RUNBOOK INPUTS --------
    const inputs = document.querySelectorAll(
      ".report-input, .report-select"
    );

    if (inputs.length > 0) {
      content += "Runbook Details:\n\n";

      inputs.forEach(input => {
      const label = input.closest("tr")?.querySelector("th")?.innerText
                || input.previousElementSibling?.innerText
                || "Field";

        let value;

   
    if (input.tagName === "SELECT") {
      value = input.value ? input.options[input.selectedIndex].text : "Not provided";
    } else {
      value = input.value || "Not provided";
    }

        content += `${label}: ${value}\n`;
      });
    }

    content += "\nGenerated from Security Management System.";

    const subject = encodeURIComponent("Runbook: " + cleanTitle);
    const body = encodeURIComponent(content);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  });
}