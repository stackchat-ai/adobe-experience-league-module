const proactiveMessagingStyles = `
  div.proactive-container {
    z-index: 100;
  }

  .proactive-container .proactive-message .message .header .name {
    color: #F3793B;
  }

  .proactive-container .proactive-message .actions .action {
    background: #fff;
    border: 1px solid #F3793B;
    color: #F3793B;
  }
`
export const addCustomStyles = () => {
  const style = window.document.createElement("style");
  style.type = "text/css";
  style.appendChild(window.document.createTextNode(proactiveMessagingStyles))
  window.document.body.appendChild(style);
}
