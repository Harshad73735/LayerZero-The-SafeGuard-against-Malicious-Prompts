import "./AlertBox.css";

function AlertBox({ message, category, onClose }) {
  return (
    <div className="alertBox">
      <div className="alertContent">
        <span className="alertIcon">⚠️</span>
        <div className="alertText">
          <p className="alertMessage">{message}</p>
          {category && <p className="alertCategory">Category: {category}</p>}
        </div>
        <button className="alertClose" onClick={onClose}>✖</button>
      </div>
    </div>
  );
}

export default AlertBox;import "./AlertBox.css";
