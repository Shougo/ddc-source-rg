# ddc-source-rg: rg completion for ddc.vim

A ddc.vim source for `rg`.

**Note: "rg" binary must be installed in your `$PATH`!!**

## Dependencies

- https://github.com/BurntSushi/ripgrep

## Configuration

```vim
call ddc#custom#patch_global('sources', ['rg'])

call ddc#custom#patch_global('sourceOptions', #{
        \   rg: #{
        \     mark: 'rg',
        \     minAutoCompleteLength: 4,
        \   },
        \ })
```

## License

MIT
