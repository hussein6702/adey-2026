export default function BodyText({className="",children}){
    return(
        <p className={`${className} font-calson font-light lg:text-[1.5rem] text-[1.3rem] text-center `}>
            {children}
        </p>
    )
    
}