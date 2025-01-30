// import { useSelector } from "react-redux";
// import { useSearchParams } from "react-router-dom";
// import { RootState } from "../redux/store";

export const Output = () => {
    // const [searchParams] = useSearchParams();
    // const replId = searchParams.get('replId') ?? '';
    // const { username } = useSelector((state: RootState) => state.user);
    const INSTANCE_URI = `http://localhost:3002/`;

    return <div style={{height: "40vh", background: "white"}}>
        <iframe width={"100%"} height={"100%"} src={`${INSTANCE_URI}`} />
    </div>
}