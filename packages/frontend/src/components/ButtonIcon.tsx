import Image from 'next/image';

interface IButtonProps {
  onClick: () => void;
  iconPath: string;
  iconWidth: number;
  iconHeight: number;
  iconText: string;
}

export const ButtonIcon = ({ iconPath, iconWidth, iconHeight, iconText }: IButtonProps) => {
  return (
    <button>
      <div className="flex justify-center items-center">
        <Image src={iconPath} width={iconWidth} height={iconHeight} alt="reply" />
        <div className="px-1"></div>
        <p style={{ color: 'gray' }}>{iconText}</p>
      </div>
    </button>
  );
};
