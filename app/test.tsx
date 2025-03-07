"use dom"
import { StyleSheet, Text, View } from "react-native";
import React from "react";
import TestComp from "@/components/TestComp";

export default function Test() {
    return (
        <View>
            <Text className="text-lg font-bold">
                {typeof document !== "undefined" ? "DOM is available" : "No DOM"}
            </Text>
        </View>
    );
}

const style = StyleSheet.create({});
