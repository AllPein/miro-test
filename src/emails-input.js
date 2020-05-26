import './styles/index.scss';

class EmailsInput {
  constructor(node, { emails, key } ){
    this.key = key || -1;
    if (emails){
      this.emails = emails.map((email) => ( { email, valid: this.validateEmail(email) } ) );
      this.setToStorage(this.emails, this.key);
    }
    else this.emails = localStorage.getItem(`emails${this.key}`) != null ?  localStorage.getItem(`emails${this.key}`).split(",")
    .map((email) => ( { email, valid: this.validateEmail(email) } )) :  [];
    this.parent = null;
    this.node = node;
    this.lastInputField = null;
    this.lastEmailTag = null;
    this.event = null;
    this.callback = null;
    this.event = new CustomEvent("emailsChanged", {bubbles: true}); //creating a custom event, which triggers when emails are changed
    this.render();

    //set ul node as parent node for li elements
    this.parent = this.node.childNodes[0];
    //get input field 
    this.lastInputField = this.parent.lastChild;
    //get last email tag
    this.lastEmailTag = this.parent.lastChild.previousSibling;


    //indicator for a backspace key to either lighten or delete last email tag
    this.isPressed = false;
    
    //adding a keydown event listener for input field
    this.lastInputField.addEventListener("keydown", e => this.keyDownListener(e));
    this.lastInputField.lastChild.addEventListener("blur", (e) => this.inputBlur(e));
    this.lastInputField.lastChild.onpaste = (e) => { 
        this.inputPaste(e);  
        setTimeout(() => { e.target.value = '' }, 0); 
    };
    this.node.addEventListener("emailsChanged", () => {
      if (this.callback)  this.callback(this.emails); //custom callback
    })
  }


  keyDownListener(e){
    if (this.isPressed && e.keyCode != 8){ //if backspace has already been pressed and user types something -  unlighten last email
      this.unlightenEmail();
      this.isPressed = false;
    }

    if (e.keyCode == 13 && e.target.value.trim() != '' && typeof e.target.value == "string"){ //if enter key is pressed - add new email
      this.createNewEmail(e, e.target.value.trim());
      
    } 
    if (e.keyCode == 188 && e.target.value.trim() != '' && e.target.value.trim() != ',' && typeof e.target.value == "string"){ //if comma key is pressed - add new email
      e.preventDefault();
      this.createNewEmail(e, e.target.value.slice(1,));
    }
    if (e.keyCode == 8 && e.target.value == '') { //if backspace key is pressed and input field is empty
      e.preventDefault(); //preventing default action for the key
      this.lightenEmail(); //lighten last email tag to warn user about incoming deletion
      if (this.isPressed) { //if backspace key has been pressed before - remove last email tag
        e.preventDefault();
        this.removeEmail(this.lastEmailTag);
      }

      this.isPressed = !this.isPressed; 
      
    }
  }

  setToStorage(emails, key){
    localStorage.setItem(`emails${key}`, emails.map((a) => a.email).join(","));
  }
  //method which creates a new node to be added to the root list
  createNewBubble(text){
    let newEmailTag = document.createElement("li");
    newEmailTag.innerText = text;
    this.validateEmail(text) ? newEmailTag.className = 'emails-valid' : newEmailTag.className = 'emails-invalid';
    let deleteBtn = document.createElement("button");
    deleteBtn.innerText = " x";
    
    newEmailTag.appendChild(deleteBtn);
  
    deleteBtn.addEventListener("click", () => {
      this.removeEmail(newEmailTag);
    })

    return newEmailTag;
  }

  createInputElement(){
    let liNodeEmail = document.createElement("li");
    liNodeEmail.className = 'emails-new';
    let input = document.createElement("input");
    input.type = 'text';
    input.placeholder = 'add new member...';

    liNodeEmail.appendChild(input);

    return liNodeEmail;
  }

  removeEmail(node){
    this.parent.removeChild(node);
    let key = this.emails.indexOf(node.innerText.slice(0, node.innerText.length - 1).trim());
    this.emails.splice(key, 1);
    this.setToStorage(this.emails, this.key);
    this.lastEmailTag = this.parent.lastChild.previousSibling;

    this.node.dispatchEvent(this.event);

  }

  render(){
    //creating an ul node which contains all emails and input element
    let ulNode = document.createElement("ul");
    ulNode.className = "emails";

    for (let email in this.emails){
      if (this.emails[email].email != ""){
        let newEmailNode = this.createNewBubble(this.emails[email].email);
        ulNode.appendChild(newEmailNode);
      }
    }

    //creating input element
    let liNodeInput = this.createInputElement();
    ulNode.appendChild(liNodeInput);

    this.node.appendChild(ulNode);
    
  }

  connectedCallback() {
    
  }
  
  inputBlur(e) {
    if (e.target.value.trim() != "")
      this.createNewEmail(e, e.target.value.trim());
  }

  inputPaste(e) {
    let clipboardData = e.clipboardData || e.originalEvent.clipboardData || window.clipboardData;
    let pastedData = clipboardData.getData('text');
    if (typeof pastedData == 'string' && pastedData.trim() != '') {
      let emails = pastedData.split(",");
      for (let email in emails){
        this.createNewEmail(e, emails[email].trim());
      }
    }
    
  }

  validateEmail(email){
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
  }

  createNewEmail(e, text){
    this.addTag(text);
    e.target.focus();
    e.target.value = '';
    this.lastEmailTag = this.parent.lastChild.previousSibling;

    this.node.dispatchEvent(this.event);

  }

  addTag(text){
    let valid = this.validateEmail(text);
    this.emails.push({email: text, valid });
    this.setToStorage(this.emails, this.key);
    let newEmail = this.createNewBubble(text);
    this.parent.insertBefore(newEmail, this.lastInputField);
  }

  
  lightenEmail(){
    this.lastEmailTag.classList.add("lightened-delete");
  }

  unlightenEmail(){
    this.lastEmailTag.classList.remove("lightened-delete");
  }
  removeBoard(){
    this.firstChild.remove();
  }


   //API methods
  getEmails(){
    return this.emails; //returns all entered emails
  }

  replaceEmails(...emails) { //replaces all entered emails into passed
      this.emails = emails.map((email) => ( { email, valid: this.validateEmail(email) } ) );
      this.node.dispatchEvent(this.event);
      this.setToStorage(this.emails, this.key);
      
      this.removeBoard();
      this.connectedCallback();
  }
  
  on(cb){ //subscribes for emails changes
    this.callback = cb;
  }

}

// exports.EmailsInput = EmailsInput;