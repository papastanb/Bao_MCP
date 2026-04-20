# Release Guide

## Validate

```bash
bun install
bun run check
bun run lint
bun run build
```

## Publish npm

```bash
npm publish --access public
```

## Create Git tag

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

## Create GitHub release

```bash
gh release create vX.Y.Z --generate-notes
```

## Post-release checks

```bash
npm view opencode-openbao-mcp-guard version
gh release view vX.Y.Z
```
