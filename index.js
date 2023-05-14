"use strict";

const onLoad = (function () {
  const logInModal = document.getElementById("loginModal");
  const confirmationModal = document.getElementById("confm-modal");
  const form = document.forms["registration"];
  const table = document.getElementById("table");
  const deleteRecord = document.getElementById("delete-record");

  let userId;

  // FUNCTION TO CLOSE CONFIRMATION MODAL
  function confModalClose() {
    confirmationModal.style.display = "none";
  }

  // FUNCTION TO CLOSE LOGIN MODAL
  function loginModalClose() {
    logInModal.style.display = "none";
  }

  // FUNCTION TO SHOW LOGIN MODAL
  function loginModalShow() {
    logInModal.style.display = "block";
  }

  //FUNCTION TO SET COOKIES
  function setCookies() {
    document.cookie = "email1=google@gmail.com";
    document.cookie = "password1=12345";
    document.cookie = "email2=yahoo@gmail.com";
    document.cookie = "password2=56789";
  }

  //FUNCTION TO VALIDATE LOGIN CREDENTIALS
  function loginValidation() {
    const email = document.querySelector('input[name="login-email"]');
    const password = document.querySelector('input[name="login-password"]');

    let isEmailCredintialValid = false;
    let isPasswordCredintialValid = false;

    const allCookies = document.cookie;
    const cookies = allCookies.split(";");

    for (const cookie of cookies) {
      const key_value = cookie.trim().split("=");

      if (key_value[0].startsWith("email") && !isEmailCredintialValid) {
        isEmailCredintialValid = key_value[1] === email.value.toLowerCase();
      } else if (
        key_value[0].startsWith("password") &&
        !isPasswordCredintialValid
      ) {
        isPasswordCredintialValid = key_value[1] === password.value;
      }
    }

    if (isEmailCredintialValid && isPasswordCredintialValid) {
      email.value = "";
      password.value = "";
      loginModalClose();
    } else {
      alert("Access is Denied");
    }
  }

  //FUNCTION TO SET MINIMUN AGE TO REGISTER
  function setMinAge() {
    const date = new Date(Date.now());

    let year = date.getFullYear();
    year -= 18;

    const ageMinYear = year + "-" + "01-01";
    form.querySelector("#dob").setAttribute("max", ageMinYear);
  }

  //FUNCTION TO CHECK IS EMAIL ALREADY REGISTERED OR NOT
  function isEmailRegistered() {
    const email = form.querySelector("#email").value;
    const data = localStorage.getItem(email);
    return data != null;
  }

  //FUNCTION TO RESET FORM
  function resetForm() {
    const inputs = document.querySelectorAll(".form-control");
    for (let input of inputs) {
      input.value = "";
      input.classList.remove("is-invalid");
    }

    const checkInput = document.getElementsByClassName("form-check-input");
    for (let input of checkInput) {
      input.checked = false;
    }
    document.getElementById("gender").classList.remove("is-invalid");
  }

  //FUNCTION TO INPUT VALIDATION
  function inputValidationHandler() {
    if (this.checkValidity()) {
      this.classList.remove("is-invalid");
    } else {
      debugger;
      this.classList.add("is-invalid");
      if (this.validity.valueMissing) {
        this.nextElementSibling.innerText = "Required";
      } else {
        let type = this.getAttribute("type");
        if (type === "date") {
          if (this.getAttribute("name") == "dob") {
            this.nextElementSibling.innerText = "Minimum age 18 year";
          } else {
            this.nextElementSibling.innerText =
              "Minimum gap between issue and expiry date is 6 month.";
          }
        } else {
          const message =
            "Please, Enter valid " + this.getAttribute("data-feedback");
          this.nextElementSibling.innerText = message;
        }
      }
    }
    return this.checkValidity();
  }

  //FUNCTION TO SELECT VALIDATION
  function selectInputValidationHandler() {
    if (this.value) {
      this.classList.remove("is-invalid");
      return true;
    } else {
      this.classList.add("is-invalid");
      return false;
    }
  }

  //FUNCTION TO GENDER VALIDATIION  (is gender selected or not)
  function genderValidationHandler() {
    const gender = document.getElementById("gender");
    const male = document.getElementById("male");
    const female = document.getElementById("female");

    if (male.checked || female.checked) {
      gender.classList.remove("is-invalid");
    } else {
      gender.classList.add("is-invalid");
    }

    male.oninput = () => {
      document.getElementById("gender").classList.remove("is-invalid");
    };
    female.oninput = () => {
      document.getElementById("gender").classList.remove("is-invalid");
    };

    return male.checked || female.checked;
  }

  //FUNCTION TO INPUT VAIDATION (all input, gender and select)
  function validateInputs() {
    const inputs = form.querySelectorAll("input:not(input[type='radio'])");
    let isAllDataValid = true;

    for (let input of inputs) {
      if (input.getAttribute("name") == "gender") {
        continue;
      }
      isAllDataValid &&= inputValidationHandler.call(input);
    }

    isAllDataValid &&= genderValidationHandler();

    const selects = document.querySelectorAll("select");
    for (let select of selects) {
      isAllDataValid &&= selectInputValidationHandler.call(select);
    }

    return isAllDataValid;
  }

  //FUNCTION TO HANDLE MINIMUN DIFFERENCE (6 month) BETWEEN ISSUE DATE AND EXPIRY DATE
  function issueExpiryDateHandler() {
    const issue = document.getElementById("issuedate");
    const expiry = document.getElementById("expirydate");

    const date = new Date(issue.value);

    let month = date.getMonth();
    month += 6;
    let day = date.getDate();
    let year = date.getFullYear();

    const minDate = new Date(year, month, day);

    day = minDate.getDate();
    if (day < 10) {
      day = "0" + day;
    } else {
      day = day.toString();
    }

    month = minDate.getMonth();
    month++;

    if (month < 10) {
      month = "0" + month;
    } else {
      month = month.toString();
    }

    const expirydate = year + "-" + month + "-" + day;
    expiry.setAttribute("min", expirydate);
  }

  //FUNCTION TO GET FORM DATA AS OBJECT
  function getFormData() {
    const formData = new FormData(form);

    const user = {};

    formData.forEach((value, key) => {
      user[key] = value;
    });

    return user;
  }

  //FUNCTION TO HANDLE CLICK EVENT ON SAVE BUTTON
  function saveData() {
    const email = form.querySelector("#email");

    if (validateInputs()) {
      const userData = getFormData();

      if (isEmailRegistered() && !userId) {
        email.classList.add("is-invalid");
        email.nextElementSibling.innerText =
          "Email is already registered. Try another one.";
        email.focus();
        return;
      }

      if (userId) {
        if (isEmailRegistered() && userId != email.value) {
          email.classList.add("is-invalid");
          email.nextElementSibling.innerText =
            "Email is already registered. Try another one.";
          email.focus();
          return;
        }
        localStorage.removeItem(userId);
        userId = userData.email;
        localStorage.setItem(userId, JSON.stringify(userData));
        alert("User data saved Successfully.");
        userId = undefined;
      } else {
        localStorage.setItem(userData.email, JSON.stringify(userData));
      }

      window.scrollTo(0, document.body.scrollHeight);
      resetForm();
      renderTable();
    }
  }

  //FUNCTION TO ADD BUTTON (delete & edit buttons) TO TABLE
  function addTableButton() {
    function addDeleteButton(target) {
      const btnNode = document.createElement("button");
      const attributes = {
        "data-action": "delete",
        "data-target": target,
        class: "btn btn-outline-danger",
        style: "width: 40px; border-radius: 50%",
      };

      for (const key in attributes) {
        btnNode.setAttribute(key, attributes[key]);
      }

      btnNode.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      return btnNode;
    }

    function addEditButton(target) {
      const btnNode = document.createElement("button");

      const attributes = {
        "data-action": "edit",
        "data-target": target,
        class: "btn btn-outline-primary",
        style: "width: 40px; margin-right: 10px;border-radius: 50%",
      };

      for (const key in attributes) {
        btnNode.setAttribute(key, attributes[key]);
      }

      btnNode.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
      return btnNode;
    }

    return {
      addEditButton: addEditButton,
      addDeleteButton: addDeleteButton,
    };
  }

  //FUNCTION TO FORMAT DATE IN TABLE
  function dateFormat(date) {
    const month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];

    date = date.split("-");
    if (date.length == 3 && !isNaN(parseInt(date[1]))) {
      return date[2] + "/" + month[parseInt(date[1]) - 1] + "/" + date[0];
    } else {
      return "01/Jan/2000";
    }
  }

  //getting object to add edit and delete buttons in table
  const tableBtn = addTableButton();

  //FUNCTION TO RENDER TABLE
  function renderTable() {
    const headerSequence = ["email", "name", "gender", "occupation"];
    const id_data = ["id-type", "idnumber"];
    const date_data = ["issuedate", "expirydate"];
    const restColumn = ["issuestate", "dob"];

    let srno = 1;

    const tableBody = document.querySelector("#table > tbody");
    tableBody.innerHTML = "";

    const length = localStorage.length;

    for (let index = 0; index < length; index++) {
      const user = JSON.parse(localStorage.getItem(localStorage.key(index)));
      const trNode = document.createElement("tr");

      const node = document.createElement("td");
      node.className = "text-center";
      node.innerText = "#" + srno++;
      trNode.appendChild(node);

      for (let key of headerSequence) {
        const tdNode = document.createElement("td");
        tdNode.innerText = user[key] === "" ? "-" : user[key];
        trNode.appendChild(tdNode);
      }

      const idTypeNumberNode = document.createElement("td");
      let idTypeNumber = user[id_data[0]] + " / " + user[id_data[1]];
      idTypeNumberNode.innerText = idTypeNumber;
      trNode.appendChild(idTypeNumberNode);

      const tdNode = document.createElement("td");

      let text =
        dateFormat(user[date_data[0]]) + " - " + dateFormat(user[date_data[1]]);
      tdNode.innerText = text;
      trNode.appendChild(tdNode);

      for (let key of restColumn) {
        const tdNode = document.createElement("td");
        if (key == "dob") {
          tdNode.innerText = dateFormat(user[key]);
        } else {
          tdNode.innerText = user[key] === "" ? "-" : user[key];
        }
        trNode.appendChild(tdNode);
      }

      //adding button column
      const userId = user["email"];

      const tdBtnNode = document.createElement("td");
      tdBtnNode.style.minWidth = "115px";
      tdBtnNode.className = "text-center";
      tdBtnNode.appendChild(tableBtn.addEditButton(userId));
      tdBtnNode.appendChild(tableBtn.addDeleteButton(userId));

      trNode.appendChild(tdBtnNode);
      trNode.id = userId;

      tableBody.appendChild(trNode);
    }
  }

  // EDIT & DELETE BUTTON (of table) HANDLER
  function tableBtnHandler(event) {
    const target = event.target;

    if (target.tagName === "BUTTON") {
      const targetedElement = target.getAttribute("data-target");
      const action = target.getAttribute("data-action");

      if (action === "delete") {
        deleteRecord.setAttribute("data-target", targetedElement);
        deleteRecord.onclick = deleteRecordHandler;
        confirmationModal.style.display = "block";
      }

      if (action === "edit") {
        resetForm();
        const user = JSON.parse(localStorage.getItem(targetedElement));

        for (let key in user) {
          switch (key) {
            case "gender":
              document.querySelector(
                "input[value='" + user[key] + "']"
              ).checked = true;
              break;

            case "id-type": {
              document.querySelector(
                "option[value='" + user[key] + "']"
              ).selected = true;
              break;
            }

            case "issueAuth": {
              document.querySelector(
                "option[value='" + user[key] + "']"
              ).selected = true;
              break;
            }

            default:
              document.querySelector("input[name='" + key + "']").value =
                user[key];
              if (key == "email") {
                userId = user[key];
              }
          }
        }
        window.scrollTo(0, 0);
      }
    }
  }

  //FUNCTION TO DELETE RECORD
  function deleteRecordHandler() {
    const targetedElement = this.getAttribute("data-target");
    localStorage.removeItem(targetedElement);
    document.getElementById(targetedElement).remove();
    confModalClose();
  }

  function onBodyRendered() {
    //setting login cookies
    setCookies();

    //setting minimun age
    setMinAge();

    //adding validation handler function to inputs (oninput and onblur)
    const inputs = form.querySelectorAll("input");
    for (let input of inputs) {
      if (input.getAttribute("name") == "gender") {
        input.onchange = genderValidationHandler;
        continue;
      }
      input.oninput = inputValidationHandler;
      input.onblur = inputValidationHandler;
    }

    //adding validation handler function to select (oninput and onblur)
    const selects = form.querySelectorAll("select");
    for (let select of selects) {
      select.oninput = selectInputValidationHandler;
      select.onblur = selectInputValidationHandler;
    }

    //setting difference of minimun 6 month on input of issue date
    document.getElementById("issuedate").onchange = issueExpiryDateHandler;

    //handling click event on save and exit button in form
    form.addEventListener("click", function (event) {
      event.stopPropagation();

      const id = event.target.id;

      if (id == "save") {
        event.preventDefault();
        saveData();
      }

      if (id == "exit") {
        event.preventDefault();
        resetForm();
        loginModalShow();
        userId = undefined;
      }
    });

    //rendering table
    renderTable();

    //handling click eventes on edit and delete buttons in table
    table.addEventListener("click", tableBtnHandler);
  }

  return {
    onBodyRendered: onBodyRendered,
    confModalClose: confModalClose,
    loginValidation: loginValidation,
  };
})();
