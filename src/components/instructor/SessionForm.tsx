import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator} from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { 
    UpdateSessionFormRequest,
    CompleteSessionFormRequest
} from "@/src/types/forms.types"
import { PreStressLevel, PostStressLevel, SleepQuality } from "@/src/types/enums";
