# Fancy Index module Hacking HOW-TO

- [Fancy Index module Hacking HOW-TO](#fancy-index-module-hacking-how-to)
  - [How to modify the template](#how-to-modify-the-template)
  - [Regenerating the C header](#regenerating-the-c-header)
  - [How to modify the built-in theme](#how-to-modify-the-built-in-theme)
    - [Theme asset paths](#theme-asset-paths)
  - [Building on Rocky Linux 9 / EL9](#building-on-rocky-linux-9--el9)

## How to modify the template

The template is in the `template.html` file. Note that comment markers are
used to control how the `template.awk` Awk script generates the C header
which gets ultimately included in the compiled object code. Comment markers
have the `<!-- var identifier -->` format. Here `identifier` must be
a valid C identifier. All the text following the marker until the next
marker will be flattened into a C string.

If the identifier is `NONE` (capitalized) the text from that marker up to
the next marker will be discarded.

## Regenerating the C header

You will need Awk. I hope any decent implementation will do, but the GNU one
is known to work flawlessly. Just do:

    awk -f template.awk template.html > template.h

If your copy of `awk` is not the GNU implementation, you will need to
install it and use `gawk` instead in the command line above.

This includes macOS where the current built-in `awk` (currently version
20070501 at time of testing on 10.13.6) doesn't apply correctly and causes
characters to be omitted from the output. `gawk` can be installed with a
package manager such as [Homebrew](https://brew.sh) or
[MacPorts](https://ports.macports.org/port/gawk).

## How to modify the built-in theme

The built-in theme files are located in the `theme/` directory:

- `header.html` - HTML header template
- `footer.html` - HTML footer template with JavaScript initialization
- `styles.css` - CSS stylesheet with light/dark theme support
- `addNginxFancyIndexForm.js` - JavaScript for search, pagination, and theme toggle

After modifying any of these files, you must regenerate the `theme_builtin.h`
header which embeds these files as C byte arrays:

    bash generate_theme.sh

The script will:

1. Convert each theme file to a C byte array
2. Generate the `theme_builtin.h` header file
3. Report the sizes of embedded assets

### Theme asset paths

When using `fancyindex_theme builtin`, the module serves embedded assets at:

- `/_nfi_theme/styles.css` - CSS stylesheet
- `/_nfi_theme/fancyindex.js` - JavaScript functionality

These paths are handled directly by the module and do not require any
filesystem configuration.

## Building on Rocky Linux 9 / EL9

Rocky Linux 9 provides the nginx source via `nginx-mod-devel` package, which
allows building dynamic modules using nginx's configure script:

    # Install dependencies
    sudo dnf install -y nginx nginx-mod-devel gcc make pcre-devel zlib-devel

    # Generate the theme header (from the ngx-fancyindex directory)
    bash generate_theme.sh

    # Find nginx source directory (nginx-mod-devel, NVR of the running nginx RPM)
    NGINX_SRC=/usr/src/nginx-$(rpm -q --qf '%{v}-%{r}' nginx)

    # Configure and build the dynamic module
    cd "$NGINX_SRC"
    ./configure --with-compat --add-dynamic-module=/path/to/ngx-fancyindex
    make modules

    # Install the module
    sudo cp objs/ngx_http_fancyindex_module.so /usr/lib64/nginx/modules/

    # Enable in nginx.conf
    load_module "modules/ngx_http_fancyindex_module.so";

The `--with-compat` flag ensures the module is compatible with the system
nginx binary without needing to match all original compile-time options.
