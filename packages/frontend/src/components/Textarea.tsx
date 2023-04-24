import styled from "styled-components";

const Container = styled.div`
    position: relative;
    width: 100%;
    z-index: 5;
    textarea,
    pre {
        width: 100%;
        border: 0px;
        padding: 10px 15px 10px 15px;
        min-height: 3.5em;
        line-height: 1.5em;
        margin: 0;
        border-top-left-radius: 7px;
        border-top-right-radius: 7px;
        -webkit-appearance: none;
        outline: none;
        background: transparent;
        word-wrap: break-word;
        white-space: pre-wrap;
        min-height: 100px;
    }

    textarea {
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        overflow: hidden;
        resize: none;
        position: absolute;
        background: white;
        border-radius: 8px;
        min-height: 100px;
    }

    .hidden {
        visibility: hidden;
        display: block;
    }
`;

interface Props {
    value: string;
    onChangeHandler: (newVal: string) => void;
    placeholder: string;
}

export const Textarea = ({ value, onChangeHandler, placeholder }: Props) => {
    return (
        <Container className="w-full relative">
            <pre className="hidden">{value}</pre>
            <textarea placeholder={placeholder} value={value} onChange={(evt) => onChangeHandler(evt.target.value)} />
        </Container>
    );
};
