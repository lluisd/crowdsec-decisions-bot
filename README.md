# crowdsec-decisions-bot

Delete decisions from the telegram bot that notifies us of decisons alerts from crowdsec HTTP notifications. 

![image](https://github.com/user-attachments/assets/ab6d0eac-58a0-4cc4-8d6e-39dcf9e31814)

This uses the notifications plugin from crowdsec https://docs.crowdsec.net/docs/notification_plugins/telegram which I modified. It needs to set up a CTI api-key https://docs.crowdsec.net/u/console/cti/cti_api_keys/ to get some IP scores:

```yaml
type: http          # Don't change
name: http_default  # Must match the registered plugin in the profile
log_level: info

format: |
  {
   "disable_notification": false,
   "chat_id": "-1000xxx000", 
   "parse_mode": "Markdown",
   "text": "
     {{range . -}}  
     {{$alert := . -}}  
     {{range .Decisions -}}
     {{- $flags := dict 
        "US" "🇺🇸" 
        "FR" "🇫🇷" 
        "DE" "🇩🇪" 
        "MX" "🇲🇽" 
        "GB" "🇬🇧" 
        "HK" "🇭🇰" 
        "ES" "🇪🇸" 
        "NL" "🇳🇱" 
        "JP" "🇯🇵" 
        "AR" "🇦🇷" 
        "BR" "🇧🇷" 
        "CA" "🇨🇦" 
        "AU" "🇦🇺" 
        "IN" "🇮🇳" 
        "IT" "🇮🇹" 
        "RU" "🇷🇺" 
        "CN" "🇨🇳" 
        "SA" "🇸🇦" 
        "ZA" "🇿🇦" 
        "KR" "🇰🇷" 
        "ID" "🇮🇩" 
        "NG" "🇳🇬" 
        "EG" "🇪🇬" 
        "TR" "🇹🇷" 
        "SE" "🇸🇪" 
        "NO" "🇳🇴" 
        "DK" "🇩🇰" 
        "FI" "🇫🇮" 
        "PL" "🇵🇱" 
        "PT" "🇵🇹" 
        "CH" "🇨🇭" 
        "BE" "🇧🇪" 
        "AT" "🇦🇹" 
        "KR" "🇰🇷" 
        "SG" "🇸🇬" 
        "MY" "🇲🇾" 
        "TH" "🇹🇭" 
        "PH" "🇵🇭" 
        "VN" "🇻🇳" 
        "PK" "🇵🇰" 
        "BD" "🇧🇩" 
        "UA" "🇺🇦" 
        "RO" "🇷🇴" 
        "HU" "🇭🇺" 
        "BG" "🇧🇬" 
        "SK" "🇸🇰" 
        "HR" "🇭🇷" 
        "SI" "🇸🇮" 
        "EE" "🇪🇪" 
        "LV" "🇱🇻" 
        "LT" "🇱🇹" 
        "CZ" "🇨🇿" 
        "IS" "🇮🇸" 
        "GR" "🇬🇷" 
        "AE" "🇦🇪" 
        "KW" "🇰🇼" 
        "OM" "🇴🇲" 
        "QA" "🇶🇦" 
        "BH" "🇧🇭" 
        "KW" "🇰🇼" 
        "MA" "🇲🇦" 
        "TN" "🇹🇳" 
        "DZ" "🇩🇿" 
        "LY" "🇱🇾" 
        "JO" "🇯🇴" 
        "LB" "🇱🇧" 
        "SY" "🇸🇾" 
        "IQ" "🇮🇶" 
        "KW" "🇰🇼" 
        "YE" "🇾🇪" 
        "IR" "🇮🇷" 
        "MN" "🇲🇳" 
        "KP" "🇰🇵" 
        "TW" "🇹🇼" 
        "MO" "🇲🇴" 
        "LC" "🇱🇨" 
        "TT" "🇹🇹" 
        "LC" "🇱🇨" 
        "VC" "🇻🇨" 
        "BB" "🇧🇧" 
        "JM" "🇯🇲" 
        "BS" "🇧🇸" 
        "GD" "🇬🇩" 
        "HT" "🇭🇹" 
        "DO" "🇩🇴" 
        "CR" "🇨🇷" 
        "PY" "🇵🇾" 
        "PE" "🇵🇪" 
        "EC" "🇪🇨" 
        "CO" "🇨🇴" 
        "VE" "🇻🇪" 
        "CL" "🇨🇱" 
        "BO" "🇧🇴" 
        "PE" "🇵🇪" 
        "GT" "🇬🇹" 
        "HN" "🇭🇳" 
        "SV" "🇸🇻" 
        "NI" "🇳🇮" 
        "PA" "🇵🇦" 
        "CU" "🇨🇺" 
        "BR" "🇧🇷" 
        "GU" "🇬🇺" 
        "AR" "🇦🇷" 
        "CL" "🇨🇱" 
        "PY" "🇵🇾" 
        "PE" "🇵🇪" 
        "BO" "🇧🇴" 
        "EC" "🇪🇨" 
        "CO" "🇨🇴" 
        "VE" "🇻🇪" -}}
     {{- $countryCode := upper $alert.Source.Cn }}
     {{- $flag := index $flags $countryCode | default $countryCode }}
     {{- $cti := $alert.Source.IP | CrowdsecCTI  -}}
     {{$flag -}}
     {{if $cti.Location.City }}{{- " "}}_{{$cti.Location.City}}_{{end}}
     {{- " "}}{{.Value}} will get {{.Type}} for next {{.Duration}} for triggering {{.Scenario}} 
     {{- " "}}({{$alert.Source.AsName}})
     {{- " "}}Maliciousness: *{{mulf $cti.GetMaliciousnessScore 100 | floor}}* %
     {{- " "}}Noise: *{{$cti.GetBackgroundNoiseScore}}*/10
     {{end -}}
     {{end -}}
   ",
   "reply_markup": {
      "inline_keyboard": [
          {{ $arrLength := len . -}}
          {{ range $i, $value := . -}}
          {{ $V := $value.Source.Value -}}
          [
              {
                  "text": "See {{ $V }} on crowdsec.net",
                  "url": "https://app.crowdsec.net/cti/{{ $V -}}"
              },
              {
                  "text": "Delete",
                  "callback_data": "deleteDecisions~{{ $V -}}"
              }
          ]{{if lt $i ( sub $arrLength 1) }},{{end }}
      {{end -}}
      ]
  }

url: https://api.telegram.org/bot738xxxxFlAI/sendMessage
method: POST
headers:
  Content-Type: "application/json"
```

Docker-compose example using Telegram Polling
```yaml
services:
  adguard-client-updater:
    image: lluisd/crowdsec-decisions-bot:latest
    container_name: crowdsec-decisions-bot
    environment:
      - TELEGRAM_TOKEN=738xxxxFlAI
      - LAPI_URL=http://crowdsec:8080
      - LAPI_LOGIN=crowdsec
      - LAPI_PASSWORD=QHtDW6QxxxxxxxxxxxxxxxvtCnKaQkjw3J
    restart: unless-stopped
```

Docker-compose example using Telegram Webhooks with Traefik reverse proxy
```yaml
services:
  adguard-client-updater:
    image: lluisd/crowdsec-decisions-bot:latest
    container_name: crowdsec-decisions-bot
    environment:
      - TELEGRAM_TOKEN=738xxxxFlAI
      - LAPI_URL=http://crowdsec:8080
      - LAPI_LOGIN=crowdsec
      - LAPI_PASSWORD=QHtDW6QxxxxxxxxxxxxxxxvtCnKaQkjw3J
      - EXTERNAL_URL=https://crowdsecbot.domain.com
      - USE_WEBHOOKS=1
    restart: unless-stopped
    networks:
      traefik:
    labels:
      - traefik.enable=true
      - traefik.http.routers.crowdsecbot.entrypoints=websecure
      - traefik.http.routers.crowdsecbot.rule=Host(`crowdsecbot.domain.com`) 
      - traefik.http.routers.crowdsecbot.tls=true
      - traefik.http.services.crowdsecbot.loadbalancer.server.port=3000
      - traefik.docker.network=traefik

networks:
  traefik:
    name: traefik
    external: true
```

Environment variables:

| Variable       | Description                                                                   | Default value | Required |
|----------------|-------------------------------------------------------------------------------|---------------| -------- |
| TELEGRAM_TOKEN | your Telegram bot API token                                                   | `null`        | Yes |
| LAPI_URL       | Your default Local API http address which uses port 8080                      | `null`        | Yes |
| LAPI_LOGIN     | Machine login of your LAPI usually in /etc/local_api_credentials.yaml file    | `crowdsec`    | Yes |
| LAPI_PASSWORD  | Machine password of your LAPI usually in /etc/local_api_credentials.yaml file | `null`        | Yes |
| USE_WEBHOOKS   | To enable Telegram webhooks, which needs to setup a public https domain       | `false`       | No |
| EXTERNAL_URL   | External url used to set up the Telegram webhook                              | `null`        | No |
| LANGUAGE       | Language for bot response messages. Supported values: `en` (English), `es` (Spanish) | `es`    | No |

