---
author: Nikola Ovcharski
pubDatetime: 2023-01-24T15:22:00Z
title: How to change the WiFi network or password on a Flightradar24 Pi24 client
postSlug: flightradar24-pi24-change-wifi
featured: false
draft: false
tags:
  - flightradar24
  - raspberry pi
  - linux
ogImage: "/images/RPi/FR24-Pi24.jpg"
description:
  You can connect to Raspberry Pi from your PC via SSH (Secure Shell). All you need is the local IP address of the Raspberry.
---

## What is Flightradar24

[Flightradar24](https://www.flightradar24.com) is a global flight tracking service that provides real-time information about thousands of aircraft around the world. It includes flight tracking information, origins and destinations, flight numbers, aircraft types, positions, altitudes, headings and speeds. It can also show replays of previous flights. 

Flightradar24 started as a hobby project in 2006 with the idea to build a network of ADS-B receivers. In 2009 the network opened to be possible for anyone with an ADS-B receiver to upload data to the network.

## Pi24 client

Everyone can join the network with own computer and ADS-B USB dongle + antenna. Flightradar24 creators provide a [software](https://www.flightradar24.com/build-your-own) for [Raspberry Pi](https://en.wikipedia.org/wiki/Raspberry_Pi) small single-board computers (SBCs). The software can upload ADB-S data to the network via ethernet or WiFi internet. Most of the people use the integrated WiFi chip in Raspberry Pi's. This allows the hardware to be placed in more relevant locations.

## New WiFi

Many people (me included) set up and run the client for months or years and forget about it. But there comes a time when you change your home network or internet provider. And all devices have to be reconfigured for the new network. And then you remember the Pi24 Raspberry and start wondering how to change it's WiFi password.   

You can hook up the Raspberry Pi to a display with a HDMI cable or you can attach a screen to the Raspberry board via a ribbon cable and power from the GPIO port. But the Flightradar24 software does not provide an option to change the password from the OS. You can't run a Terminal (or I am not familiar how to do it).

## SSH

You can connect to Raspberry Pi from your PC via SSH (Secure Shell). [PuTTY](https://putty.org/) is a popular and free SSH client for Windows. All you need is the local IP address of the Raspberry. But if you already changed the WiFi network, how can you connect to the Pi? With ethernet. You need to connect the Pi via cable and find the local IP address. [Angry IP Scanner](https://angryip.org/) for Windows/Mac or one of the many apps for Android and iOS can help with that. 

![Devices](/images/RPi/Devices.jpg)

```js
ssh pi@192.168.0.12
```

Replace 192.168.0.12 with your Pi's actual IP address.

```js
Login: pi
Password : raspberry
```

![Flightradar24 Pi24](/images/RPi/FR24-Pi24.jpg)

In the file `wpa_supplicant.conf` is stored the data for WiFi networks. The file is located in `/etc/wpa_supplicant/` on the Pi. You can edit it with:

```js
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
```

![Flightradar24 Pi24](/images/RPi/FR24-Pi24-SSID.jpg)

`ssid` - your router's WiFi network name.

`psk` - your router's WiFi password.

Edit and save the file.
