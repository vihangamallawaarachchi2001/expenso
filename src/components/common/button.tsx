type ButtonProps = {
    title: string;
    onclick?: () => void;
    classNameBtn?: string;
    classNameIcon?: string;
    classNameTitle?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
  };
  
  const Button = ({ title, onclick, classNameBtn, classNameTitle, classNameIcon, disabled, icon }: ButtonProps) => {
    return (
      <button
        type="button"
        onClick={onclick}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 ${classNameBtn}`}
      >
        {icon && <span className={classNameIcon}>{icon}</span>}
        <span className={classNameTitle}>{title}</span>
      </button>
    );
  };
  
  export default Button;
  