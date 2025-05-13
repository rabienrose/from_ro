import './Model.css';

const Model = (props) => {
  console.log(props)
  return (
    <div className="model-container">
      <div className="model-wrapper" style={{width: props.width}}> 
        {props.children}
      </div>
    </div>
  );
};

export default Model;