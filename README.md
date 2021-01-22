# International BMP Database Statistical Analysis Tool and Web Map

This repo contains components of the [International BMP Database Website](https://bmpdatabase.org). The website itself is built on Squarespace however it embedds dynamic components built with [Ionic 5](https://ionicframework.com/docs) and [Angular](https://github.com/angular/angular). The components are also used in the [NCHRP DOT Portal](https://dot.bmpdatabase.org/) which is built in WordPress

[Refer to Ionic's documentation](https://ionicacademy.com/getting-started-with-ionic-4/) for how to setup your development environment.

This web application consists of two primary components 1) Statistical Analysis Tool (Stats Tool) and 2) Web Map

## Stats Tool

The Stats Tool component allows users to access, select, filter, display and download BMP Database data. It also display computed statistics and associated plots.

## Web Map

The Web Map is a mapping component that displays a slippy map showing sites that have contributed data to the International BMP Database. It allows users to view access and download data for specific sites by deeplinking within popups for sites on the map to the Statistical Analysis Tool component with the appropriate query variables needed to filter data for that component.
