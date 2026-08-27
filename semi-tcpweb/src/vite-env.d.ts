/// <reference types="vite/client" />

declare namespace NodeJS {
  type Timeout = ReturnType<typeof setTimeout>;
}
