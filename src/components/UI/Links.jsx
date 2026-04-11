import Link from "next/link"
export default function Links({children, className=""}){
    return(
        <div className={`flex font-calson font-light text-[1.2rem] gap-5 underline not-italic ${className}`}>
            {children}
        </div>
    )
}