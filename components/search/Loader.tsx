import React from 'react';
import "../../public/Loader.css";
import {BounceLoader} from "react-spinners";

const Loader: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-8">
            <BounceLoader size='100px' color="#3186e8"></BounceLoader>
        </div>
    );
};

export default Loader;
