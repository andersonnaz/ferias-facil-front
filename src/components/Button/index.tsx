import type { ButtonHTMLAttributes, MouseEventHandler } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    title?: string
    onClick?: MouseEventHandler
}

export const Button = ({title, onClick}: ButtonProps) => {
    return (
        <button
            className="bg-[#217346] p-2 rounded-full shadow-state-800 shadow-md"
            onClick={onClick}
        >
            {title}
        </button>
    )
}