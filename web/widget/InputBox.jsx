import './InputBox.css';

const InputBox = (props) => {
  return (
    <div className='common-input-wrapper' style={props.style}>
      {props.iconSrc?<img src={props.iconSrc} className='common-input-icon'/>:null}
      <input type="text" placeholder={props.placeholder} className='common-input'/>
    </div>
  );
};

export default InputBox;