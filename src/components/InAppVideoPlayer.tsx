import React, { useEffect } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";
import { themes } from "@/src/context/themes";
import { AppText } from "@/src/components/ui";

type InAppVideoPlayerProps = {
  visible: boolean;
  url: string | null;
  title?: string;
  onClose: () => void;
};

function ActivePlayer({
  url,
  title,
  onClose,
}: {
  url: string;
  title?: string;
  onClose: () => void;
}) {
  const player = useVideoPlayer(url, (video) => {
    video.play();
  });

  useEffect(() => {
    return () => {
      player.pause();
    };
  }, [player]);

  return (
    <SafeAreaView testID="in-app-video-player" style={styles.screen}>
      <View style={styles.header}>
        <AppText style={styles.title} numberOfLines={1}>
          {title || "Video"}
        </AppText>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close video"
          hitSlop={8}
        >
          <AppText style={styles.close}>Close</AppText>
        </Pressable>
      </View>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
      />
    </SafeAreaView>
  );
}

export function InAppVideoPlayer({ visible, url, title, onClose }: InAppVideoPlayerProps) {
  const open = visible && !!url;

  return (
    <Modal
      visible={open}
      animationType="fade"
      presentationStyle="fullScreen"
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={onClose}
    >
      {open && url ? <ActivePlayer url={url} title={title} onClose={onClose} /> : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: themes.background,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    color: themes.textPrimary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
  },
  close: {
    color: themes.vegasGold,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
  },
  video: {
    flex: 1,
    width: "100%",
    backgroundColor: themes.black,
    borderRadius: 12,
    overflow: "hidden",
  },
});
