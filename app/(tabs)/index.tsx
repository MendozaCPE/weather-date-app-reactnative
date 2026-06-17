import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Weather & Location States
  const [weatherData, setWeatherData] = useState<{
    temp: number;
    desc: string;
    humidity: number;
    windSpeed: number;
    code: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lat = 14.0722;
  const lon = 120.6358;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time as "12:07:36 AM"
  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = hours.toString().padStart(2, "0");
    return `${hoursStr}:${minutes}:${seconds} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayNum = date.getDate();
    const year = date.getFullYear();
    return `${dayName}, ${monthName} ${dayNum}, ${year}`;
  };

  // Weather code to description mapping
  const getWeatherDescription = (code: number) => {
    switch (code) {
      case 0:
        return "Clear Sky";
      case 1:
      case 2:
      case 3:
        return "Partly Cloudy";
      case 45:
      case 48:
        return "Foggy";
      case 51:
      case 53:
      case 55:
        return "Naambon";
      case 61:
      case 63:
      case 65:
        return "Rainy";
      case 66:
      case 67:
      case 80:
      case 81:
      case 82:
        return "Showers";
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return "Snowy";
      case 95:
      case 96:
      case 99:
        return "Thunderstorm";
      default:
        return "Partly Cloudy";
    }
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      const data = await response.json();
      const current = data.current;
      setWeatherData({
        temp: Math.round(current.temperature_2m),
        desc: getWeatherDescription(current.weather_code),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        code: current.weather_code,
      });
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const weatherTimer = setInterval(() => {
      fetchWeather();
    }, 30000); // 30 seconds
    return () => clearInterval(weatherTimer);
  }, []);

  return (
    <LinearGradient colors={["#4A0E17", "#2A080C"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <Tabs.Screen
          options={{
            headerShown: false,
            tabBarStyle: { display: "none" }, // Hides the bottom navigation tab bar to replicate the standalone layout
          }}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Location Badge */}
          <View style={styles.locationBadge}>
            <Ionicons name="location-sharp" size={15} color="#D4AF37" />
            <Text style={styles.locationText}>NASUGBU BATANGAS, PH</Text>
          </View>

          {/* Card 1: Current Time */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={16} color="#D4AF37" />
              <Text style={styles.cardTitle}>CURRENT TIME</Text>
            </View>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={15} color="#A3A3A3" />
              <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
            </View>
          </View>

          {/* Card 2: Weather Updates */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.weatherQuestionMark}>?</Text>
              <Text style={styles.cardTitle}>WEATHER UPDATES</Text>
            </View>

            {loading && !weatherData ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text style={styles.loadingText}>Loading Weather...</Text>
              </View>
            ) : error ? (
              <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  onPress={fetchWeather}
                  style={styles.retryBtn}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : weatherData ? (
              <>
                <Text style={styles.tempText}>{weatherData.temp}°C</Text>
                <Text style={styles.weatherDesc}>{weatherData.desc}</Text>

                {/* Stats Sub-container */}
                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>HUMIDITY</Text>
                    <Text style={styles.statValue}>
                      {weatherData.humidity}%
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>WIND</Text>
                    <Text style={styles.statValue}>
                      {weatherData.windSpeed} km/h
                    </Text>
                  </View>
                </View>
              </>
            ) : null}
          </View>

          {/* Card 3: React Native Dev */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="logo-react" size={16} color="#D4AF37" />
              <Text style={styles.cardTitle}>REACT NATIVE</Text>
            </View>
            <Text style={styles.nameText}>SIR MAGS</Text>
          </View>

          {/* Footer Live Monitor */}
          <View style={styles.footer}>
            <Ionicons
              name="logo-react"
              size={16}
              color="#D4AF37"
              style={styles.footerIcon}
            />
            <Text style={styles.footerText}>REACT NATIVE · LIVE MONITORS</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    alignItems: "stretch",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: Platform.OS === "ios" ? 10 : 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
    letterSpacing: 1.2,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    color: "#A3A3A3",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  retryBtn: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: "#D4AF37",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 15,
  },
  retryText: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 8,
    letterSpacing: 1.8,
  },
  weatherQuestionMark: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 16,
    marginRight: 6,
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  dateText: {
    color: "#A3A3A3",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  tempText: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "800",
    lineHeight: 52,
  },
  weatherDesc: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    color: "#A3A3A3",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1,
    marginVertical: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20,
    paddingVertical: 10,
  },
  footerIcon: {
    marginRight: 8,
  },
  footerText: {
    color: "#A3A3A3",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
});
