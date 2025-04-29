# @mipra-helper/tsconfig

**mipra-helper** typescript 开发配置

- tsconfig.app.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "jsx": "preserve",
    "strict": true,
    "target": "ES2015",
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "moduleResolution": "Node",
    "lib": ["ES2015", "DOM"]
  }
}
```

- tsconfig.node.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "jsx": "preserve",
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "moduleResolution": "Node",
    "lib": ["ES2022", "DOM"]
  }
}
```
