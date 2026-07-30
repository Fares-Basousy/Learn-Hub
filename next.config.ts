import type { NextConfig } from "next";
import { env } from "process";

const db = process.env.postgresql
const nextConfig: NextConfig = {
    
      env:{
      postresql : db
    }
  /* config options here */
  }

export default nextConfig;
