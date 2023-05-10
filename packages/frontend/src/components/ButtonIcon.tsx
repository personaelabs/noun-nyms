import SVG from 'react-inlinesvg';
import styled from 'styled-components';

interface IButtonProps {
  onClick: () => void;
  iconPath: string;
  iconWidth: number;
  hoverBgColor?: string;
  bgColor?: string;
  iconHeight: number;
  iconText: string;
}

export const ButtonContainer = styled.button<{ hoverBgColor?: string; bgColor?: string }>`
  &:hover {
    svg {
      color: ${(props) => props.hoverBgColor || 'transparent'};
    }
  }
  svg {
    color: ${(props) => props.bgColor || 'transparent'};
  }
`;

export const ButtonIcon = ({
  iconPath,
  iconWidth,
  hoverBgColor,
  bgColor,
  iconHeight,
  iconText,
  onClick,
}: IButtonProps) => {
  return (
    <ButtonContainer hoverBgColor={hoverBgColor} bgColor={bgColor} onClick={onClick}>
      <div className="flex justify-center items-center">
        <SVG src={iconPath} height={iconHeight} width={iconWidth} fill={bgColor} />
        <div className="px-1"></div>
        <p style={{ color: 'gray' }}>{iconText}</p>
      </div>
    </ButtonContainer>
  );
};
