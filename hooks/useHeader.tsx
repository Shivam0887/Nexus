"use client";

import { createContext, useContext } from "react";

export const HeaderContext = createContext({ insideHeader: false });

export const useHeader = () => useContext(HeaderContext);
