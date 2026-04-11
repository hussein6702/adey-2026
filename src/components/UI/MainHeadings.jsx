export default function MainHeadings({ className = "", children }) {
    return (
        <h1 className={`${className} lg:text-[7rem] text-[3rem] text-center lg:text-left font-calson `}>
            {children}
        </h1>
    );
}
