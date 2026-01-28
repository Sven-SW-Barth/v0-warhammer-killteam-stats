"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Severity = "low" | "medium" | "high"

interface ServiceAlertSettings {
  enabled: boolean
  severity: Severity
}

const severityConfig = {
  low: {
    bgColor: "bg-yellow-500/90",
    textColor: "text-yellow-950",
    borderColor: "border-yellow-600",
    message: (
      <>
        Service Alert: We are aware of an issue affecting <strong>KT Open Play</strong> and are working on a fix. Thanks for your patience, it will be up and running in no time!
      </>
    ),
  },
  medium: {
    bgColor: "bg-orange-500/90",
    textColor: "text-orange-950",
    borderColor: "border-orange-600",
    message: (
      <>
        Service Alert: We are aware of an issue affecting <strong>KT Open Play</strong> and are working on a fix. Thanks for your patience, it will be up and running in no time!
      </>
    ),
  },
  high: {
    bgColor: "bg-red-500/90",
    textColor: "text-white",
    borderColor: "border-red-600",
    message: (
      <>
        Service Alert: We are aware of a critical issue affecting <strong>KT Open Play</strong> and are working on a fix. This may take some time to resolve. Thank you for your patience!
      </>
    ),
  },
}

export function ServiceAlertBanner() {
  const [settings, setSettings] = useState<ServiceAlertSettings | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check if already dismissed in this session
        if (typeof window !== "undefined") {
          const dismissed = sessionStorage.getItem("service_alert_dismissed")
          if (dismissed === "true") {
            setIsDismissed(true)
          }
        }

        const supabase = createClient()
        const { data } = await supabase
          .from("system_settings")
          .select("key, value")
          .in("key", ["service_alert_enabled", "service_alert_severity"])

        if (data) {
          const enabledSetting = data.find((s) => s.key === "service_alert_enabled")
          const severitySetting = data.find((s) => s.key === "service_alert_severity")

          setSettings({
            enabled: enabledSetting?.value === "true",
            severity: (severitySetting?.value as Severity) || "low",
          })
        }
      } catch (error) {
        console.error("Error loading service alert settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("service_alert_dismissed", "true")
    }
  }

  if (isLoading || !settings?.enabled || isDismissed) {
    return null
  }

  const config = severityConfig[settings.severity]

  return (
    <div className={`${config.bgColor} ${config.textColor} border-b ${config.borderColor}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{config.message}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-full p-1 hover:bg-black/10 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
