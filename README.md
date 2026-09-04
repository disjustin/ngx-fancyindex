# Nginx Fancy Index module

[![Build Status](https://travis-ci.com/aperezdc/ngx-fancyindex.svg?branch=master)](https://travis-ci.com/aperezdc/ngx-fancyindex)

The Fancy Index module makes possible the generation of file listings,
like the built-in
[autoindex](http://wiki.nginx.org/NginxHttpAutoindexModule) module does,
but adding a touch of style. This is possible because the module allows
a certain degree of customization of the generated content:

- **Built-in modern theme** with search, sorting, light/dark mode, and
  responsive design.
- Custom headers, either local or stored remotely.
- Custom footers, either local or stored remotely.
- Add your own CSS style rules.
- Allow choosing to sort elements by name (default), modification time,
  or size; both ascending (default), or descending.

This module is designed to work with [Nginx](https://nginx.org), a high
performance open source web server written by [Igor
Sysoev](http://sysoev.ru).

- [Nginx Fancy Index module](#nginx-fancy-index-module)
  - [Requirements](#requirements)
    - [Rocky Linux 9 / RHEL 9 / AlmaLinux 9](#rocky-linux-9--rhel-9--almalinux-9)
      - [Debugging Nginx Issues](#debugging-nginx-issues)
    - [CentOS 7/8, RHEL 7/8, Fedora Linux](#centos-78-rhel-78-fedora-linux)
    - [macOS](#macos)
    - [Other platforms](#other-platforms)
  - [Building](#building)
  - [Example](#example)
    - [Built-in Theme (Recommended)](#built-in-theme-recommended)
    - [Default Style](#default-style)
    - [External Themes](#external-themes)
  - [Directives](#directives)
    - [fancyindex](#fancyindex)
    - [fancyindex\_default\_sort](#fancyindex_default_sort)
    - [fancyindex\_case\_sensitive](#fancyindex_case_sensitive)
    - [fancyindex\_directories\_first](#fancyindex_directories_first)
    - [fancyindex\_css\_href](#fancyindex_css_href)
    - [fancyindex\_exact\_size](#fancyindex_exact_size)
    - [fancyindex\_footer](#fancyindex_footer)
    - [fancyindex\_header](#fancyindex_header)
    - [fancyindex\_show\_path](#fancyindex_show_path)
    - [fancyindex\_ignore](#fancyindex_ignore)
    - [fancyindex\_hide\_symlinks](#fancyindex_hide_symlinks)
    - [fancyindex\_localtime](#fancyindex_localtime)
    - [fancyindex\_time\_format](#fancyindex_time_format)
    - [fancyindex\_theme](#fancyindex_theme)

## Requirements

### Rocky Linux 9 / RHEL 9 / AlmaLinux 9

For Rocky Linux 9 and other EL9 distributions, you can build the module
as a dynamic module against the system nginx package:

```bash
# Install nginx and development tools
sudo dnf install -y nginx nginx-mod-devel gcc make pcre-devel zlib-devel

# Clone the source
git clone https://github.com/aperezdc/ngx-fancyindex.git
cd ngx-fancyindex

# Generate the embedded theme (if not already present)
bash generate_theme.sh

# Find nginx source directory (nginx-mod-devel, NVR of the running nginx RPM)
NGINX_SRC=/usr/src/nginx-$(rpm -q --qf '%{v}-%{r}' nginx)

# Configure and build the dynamic module
cd "$NGINX_SRC"
./configure --with-compat --add-dynamic-module=/path/to/ngx-fancyindex
make modules

# Install the module
sudo cp objs/ngx_http_fancyindex_module.so /usr/lib64/nginx/modules/
```

Then load the module in `/etc/nginx/nginx.conf`. It's placement should precede the http block and events block, if applicable:

```bash
load_module "modules/ngx_http_fancyindex_module.so";
```

#### Debugging Nginx Issues

Without loading the nginx module, I encountered this error when running `nginx -t`

```bash
nginx: [emerg] unknown directive "fancyindex_theme" in /etc/nginx/nginx.conf:96
nginx: configuration file /etc/nginx/nginx.conf test failed
```

If the nginx module directive is specified in the wrong place, this error may appear:

```bash
nginx: [emerg] "load_module" directive is specified too late in /etc/nginx/nginx.conf:13
nginx: configuration file /etc/nginx/nginx.conf test failed
```

The nginx install path may vary based on the installation configuration.

```bash
nginx: [emerg] dlopen() "/usr/share/nginx/modules/ngx_http_fancyindex_module.so" failed (/usr/share/nginx/modules/ngx_http_fancyindex_module.so: cannot open shared object file: No such file or directory) in /etc/nginx/nginx.conf:6
```

```diff
-sudo cp objs/ngx_http_fancyindex_module.so /usr/lib64/nginx/modules/
+sudo cp objs/ngx_http_fancyindex_module.so /usr/share/nginx/modules/
```

### CentOS 7/8, RHEL 7/8, Fedora Linux

For users of the [official
stable](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)
Nginx repository, [extra packages repository with dynamic
modules](https://www.getpagespeed.com/redhat) is available and
fancyindex is included.

Install repository configuration, then the module package:

```bash
yum -y install https://extras.getpagespeed.com/release-latest.rpm
yum -y install nginx-module-fancyindex
```

Then load the module in `/etc/nginx/nginx.conf` using:

```bash
    load_module "modules/ngx_http_fancyindex_module.so";
```

### macOS

Users can [install Nginx on macOS with
MacPorts](https://ports.macports.org/port/nginx); fancyindex is
included:

```bash
sudo port install nginx
```

### Other platforms

In most other cases you will need the sources for
[Nginx](https://nginx.org). Any version starting from the 0.8 series
should work.

In order to use the `fancyindex_header_` and `fancyindex_footer_`
directives you will also need the
[ngx_http_addition_module](https://nginx.org/en/docs/http/ngx_http_addition_module.html)
built into Nginx.

## Building

1. Unpack the [Nginx](https://nginx.org) sources:

        gunzip -c nginx-?.?.?.tar.gz | tar -xvf -

2. Unpack the sources for the fancy indexing module:

        gunzip -c nginx-fancyindex-?.?.?.tar.gz | tar -xvf -

3. Change to the directory which contains the
    [Nginx](https://nginx.org) sources, run the configuration script
    with the desired options and be sure to put an `--add-module` flag
    pointing to the directory which contains the source of the fancy
    indexing module:

        $ cd nginx-?.?.?
        $ ./configure --add-module=../nginx-fancyindex-?.?.? \
           [--with-http_addition_module] [extra desired options]

    Since version 0.4.0, the module can also be built as a [dynamic
    module](https://www.nginx.com/resources/wiki/extending/converting/),
    using `--add-dynamic-module=…` instead and
    `load_module "modules/ngx_http_fancyindex_module.so";` in the
    configuration file

4. Build and install the software:

        make

    And then, as `root`:

        # make install

5. Configure [Nginx](https://nginx.org) by using the modules'
    configuration [directives](#directives).

## Example

### Built-in Theme (Recommended)

The easiest way to get started is with the built-in theme, which
includes search, sorting, light/dark mode toggle, and responsive design:

```bash
location / {
  fancyindex on;              # Enable fancy indexes.
  fancyindex_exact_size off;  # Output human-readable file sizes.
  fancyindex_theme builtin;   # Use the built-in modern theme.
}
```

The built-in theme serves all required CSS and JavaScript directly from
the module - no external files or directories are needed.

### Default Style

You can also use the default minimal built-in style:

```bash
location / {
  fancyindex on;              # Enable fancy indexes.
  fancyindex_exact_size off;  # Output human-readable file sizes.
}
```

### External Themes

The following themes demonstrate the level of customization which can be
achieved using the module:

- [Theme](https://github.com/TheInsomniac/Nginx-Fancyindex-Theme) by
  [@TheInsomniac](https://github.com/TheInsomniac). Uses custom header
  and footer.
- [Theme](https://github.com/Naereen/Nginx-Fancyindex-Theme) by
  [@Naereen](https://github.com/Naereen/). Uses custom header and
  footer. The header includes a search field to filter by file name
  using JavaScript.
- [Theme](https://github.com/fraoustin/Nginx-Fancyindex-Theme) by
  [@fraoustin](https://github.com/fraoustin). Responsive theme using
  Material Design elements.
- [Theme](https://github.com/alehaa/nginx-fancyindex-flat-theme) by
  [@alehaa](https://github.com/alehaa). Simple, flat theme based on
  Bootstrap 4 and FontAwesome.

## Directives

### fancyindex

Syntax  
*fancyindex* \[*on* \| *off*\]

Default  
fancyindex off

Context  
http, server, location

Description  
Enables or disables fancy directory indexes.

### fancyindex_default_sort

Syntax  
*fancyindex_default_sort* \[*name* \| *size* \| *date* \| *name_desc* \|
*size_desc* \| *date_desc*\]

Default  
fancyindex_default_sort name

Context  
http, server, location

Description  
Defines sorting criterion by default.

### fancyindex_case_sensitive

Syntax  
*fancyindex_case_sensitive* \[*on* \| *off*\]

Default  
fancyindex_case_sensitive on

Context  
http, server, location

Description  
If enabled (default setting), sorting by name will be case-sensitive. If
disabled, case will be ignored when sorting by name.

### fancyindex_directories_first

Syntax  
*fancyindex_directories_first* \[*on* \| *off*\]

Default  
fancyindex_directories_first on

Context  
http, server, location

Description  
If enabled (default setting), groups directories together and sorts them
before all regular files. If disabled, directories are sorted together
with files.

### fancyindex_css_href

Syntax  
*fancyindex_css_href uri*

Default  
fancyindex_css_href ""

Context  
http, server, location

Description  
Allows inserting a link to a CSS style sheet in generated listings. The
provided *uri* parameter will be inserted as-is in a `<link>` HTML tag.
The link is inserted after the built-in CSS rules, so you can override
the default styles.

### fancyindex_exact_size

Syntax  
*fancyindex_exact_size* \[*on* \| *off*\]

Default  
fancyindex_exact_size on

Context  
http, server, location

Description  
Defines how to represent file sizes in the directory listing: either
accurately, or rounding off to the kilobyte, the megabyte and the
gigabyte.

### fancyindex_footer

Syntax  
*fancyindex_footer path* \[*subrequest* \| *local*\]

Default  
fancyindex_footer ""

Context  
http, server, location

Description  
Specifies which file should be inserted at the foot of directory
listings. If set to an empty string, the default footer supplied by the
module will be sent. The optional parameter indicates whether the *path*
is to be treated as a URI to load using a *subrequest* (the default), or
whether it refers to a *local* file.

> [!NOTE]
> Using this directive needs the [ngx_http_addition_module]() built into
> Nginx.

> [!WARNING]
> When inserting custom a header/footer, a subrequest will be issued so
> potentially any URL can be used as source for them. Although it will
> work with external URLs, only using internal ones is supported.
> External URLs are totally untested and using them will make
> [Nginx](https://nginx.org) block while waiting for the subrequest to
> complete. If you feel like external header/footer is a must-have for
> you, please [let me know](mailto:aperez@igalia.com).

### fancyindex_header

Syntax  
*fancyindex_header path* \[*subrequest* \| *local*\]

Default  
fancyindex_header ""

Context  
http, server, location

Description  
Specifies which file should be inserted at the head of directory
listings. If set to an empty string, the default header supplied by the
module will be sent. The optional parameter indicates whether the *path*
is to be treated as a URI to load using a *subrequest* (the default), or
whether it refers to a *local* file.

> [!NOTE]
> Using this directive needs the [ngx_http_addition_module]() built into
> Nginx.

### fancyindex_show_path

Syntax  
*fancyindex_show_path* \[*on* \| *off*\]

Default  
fancyindex_show_path on

Context  
http, server, location

Description  
Whether or not to output the path and the closing \</h1\> tag after the
header. This is useful when you want to handle the path displaying with
a PHP script for example.

> [!WARNING]
> This directive can be turned off only if a custom header is provided
> using fancyindex_header.

fancyindex_show_dotfiles \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~~
:Syntax: *fancyindex_show_dotfiles* \[*on* \| *off*\] :Default:
fancyindex_show_dotfiles off :Context: http, server, location
:Description: Whether to list files that are preceded with a dot. Normal
convention is to hide these.

### fancyindex_ignore

Syntax  
*fancyindex_ignore string1 \[string2 \[... stringN\]\]*

Default  
No default.

Context  
http, server, location

Description  
Specifies a list of file names which will not be shown in generated
listings. If Nginx was built with PCRE support, strings are interpreted
as regular expressions.

### fancyindex_hide_symlinks

Syntax  
*fancyindex_hide_symlinks* \[*on* \| *off*\]

Default  
fancyindex_hide_symlinks off

Context  
http, server, location

Description  
When enabled, generated listings will not contain symbolic links.

fancyindex_hide_parent_dir
\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~~ :Syntax:
*fancyindex_hide_parent_dir* \[*on* \| *off*\] :Default:
fancyindex_hide_parent_dir off :Context: http, server, location
:Description: When enabled, it will not show the parent directory.

### fancyindex_localtime

Syntax  
*fancyindex_localtime* \[*on* \| *off*\]

Default  
fancyindex_localtime off

Context  
http, server, location

Description  
Enables showing file times as local time. Default is “off” (GMT time).

### fancyindex_time_format

Syntax  
*fancyindex_time_format* string

Default  
fancyindex_time_format "%Y-%b-%d %H:%M"

Context  
http, server, location

Description  
Format string used for timestamps. The format specifiers are a subset of
those supported by the [strftime](https://linux.die.net/man/3/strftime)
function, and the behavior is locale-independent (for example, day and
month names are always in English). The supported formats are:

- `%a`: Abbreviated name of the day of the week.
- `%A`: Full name of the day of the week.
- `%b`: Abbreviated month name.
- `%B`: Full month name.
- `%d`: Day of the month as a decimal number (range 01 to 31).
- `%e`: Like `%d`, the day of the month as a decimal number, but a
  leading zero is replaced by a space.
- `%F`: Equivalent to `%Y-%m-%d` (the ISO 8601 date format).
- `%H`: Hour as a decimal number using a 24-hour clock (range 00 to 23).
- `%I`: Hour as a decimal number using a 12-hour clock (range 01 to 12).
- `%k`: Hour (24-hour clock) as a decimal number (range 0 to 23); single
  digits are preceded by a blank.
- `%l`: Hour (12-hour clock) as a decimal number (range 1 to 12); single
  digits are preceded by a blank.
- `%m`: Month as a decimal number (range 01 to 12).
- `%M`: Minute as a decimal number (range 00 to 59).
- `%p`: Either "AM" or "PM" according to the given time value.
- `%P`: Like `%p` but in lowercase: "am" or "pm".
- `%r`: Time in a.m. or p.m. notation. Equivalent to `%I:%M:%S %p`.
- `%R`: Time in 24-hour notation (`%H:%M`).
- `%S`: Second as a decimal number (range 00 to 60).
- `%T`: Time in 24-hour notation (`%H:%M:%S`).
- `%u`: Day of the week as a decimal, range 1 to 7, Monday being 1.
- `%w`: Day of the week as a decimal, range 0 to 6, Monday being 0.
- `%y`: Year as a decimal number without a century (range 00 to 99).
- `%Y`: Year as a decimal number including the century.

### fancyindex_theme

Syntax  
*fancyindex_theme* \[*off* \| *builtin*\]

Default  
fancyindex_theme off

Context  
http, server, location

Description  
Enables the built-in modern theme. When set to `builtin`, the module
uses an embedded theme with the following features:

- Modern, responsive design that works on desktop and mobile
- Light and dark mode with automatic detection and manual toggle
- Real-time search/filter functionality
- Pagination for directories with many files
- Breadcrumb navigation
- File type icons
- Keyboard shortcuts (`/` for search, `t` for theme toggle)

The built-in theme serves CSS and JavaScript directly from the module at
`/_nfi_theme/*` paths. No external files are required.

When set to `off` (the default), the traditional behavior is used, and
you can customize the appearance using `fancyindex_header`,
`fancyindex_footer`, and `fancyindex_css_href`.
