export default function Headings({ className = "", children }) {
    return (
        <h1 className={`${className} font-eb lg:text-[4rem] lg:text-left md:text-[3rem] text-[2.5rem]`}>
            {children}
        </h1>
    );
}
