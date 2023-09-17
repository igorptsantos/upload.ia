import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { FileVideo, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { api } from "@/lib/axios";

type Status = "waiting" | "converting" | "uploading" | "generating" | "sucess";
const statusMessages = {
  waiting: "Carregar vídeo",
  converting: "Transcrevendo aúdio",
  uploading: "Uploading",
  generating: "Gerando a resposta",
  sucess: "Sucesso!",
};

function UploadButonMessage(status: Status): string {
  return statusMessages[status];
}

interface VideoInputFormProps {
  onVideoUploaded: (id: string) => void;
}

export function VideoInputForm(props: VideoInputFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("waiting");

  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget || {};

    if (!files) {
      return;
    }
    const selectedFile = files[0];
    setVideoFile(selectedFile);
    setStatus("waiting");
  }

  async function convertVideoToAudio(video: File): Promise<File> {
    console.log("Converting video to audio...");

    const ffmpeg = await getFFmpeg();
    await ffmpeg.writeFile("input.mp4", await fetchFile(video));

    ffmpeg.on("progress", (progress) =>
      console.log("Convert progress: " + Math.round(progress.progress * 100))
    );

    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-map",
      "0:a",
      "-b:a",
      "20k",
      "-acodec",
      "libmp3lame",
      "output.mp3",
    ]);

    const convertedAudio = await ffmpeg.readFile("output.mp3");
    const audioFileBlob = new Blob([convertedAudio], { type: "audio/mpeg" });
    const audioFile = new File([audioFileBlob], "audio.mp3", {
      type: "audio/mpeg",
    });

    return audioFile;
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = promptInputRef.current?.value;

    if (!videoFile) return;
    setStatus("converting");

    const audioFile = await convertVideoToAudio(videoFile);
    const data = new FormData();

    data.append("file", audioFile);

    setStatus("uploading");
    const response = await api.post("/videos", data);

    const videoId = response?.data?.id;

    setStatus("generating");
    await api.post(`/videos/${videoId}/transcription`, {
      prompt,
    });

    setStatus("sucess");
    props.onVideoUploaded(videoId);
  }

  const previewURL = useMemo(() => {
    if (!videoFile) return;
    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  return (
    <form action="" className="space-y-6" onSubmit={handleUploadVideo}>
      <label
        htmlFor="video"
        className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
      >
        {videoFile ? (
          <video
            src={previewURL}
            controls={false}
            className="pointer-events-none absolute inset-0" // Torna a tag vídeo invisível em relação ao mouse
          />
        ) : (
          <>
            Selecione um vídeo
            <FileVideo className="w-4 h-4" />
          </>
        )}
      </label>
      <input
        type="file"
        name=""
        id="video"
        accept="video/mp4"
        className="sr-only"
        onChange={handleFileSelected}
      />
      {/* sr-only => Apenas visível para leitores de tela */}

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de Transcrição</Label>
        <Textarea
          disabled={status !== "waiting"}
          ref={promptInputRef}
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)"
        />
      </div>

      <Button
        data-sucess={status === "sucess"}
        disabled={status !== "waiting"}
        type="submit"
        className="w-full data-[sucess=true]:bg-emerald-400"
      >
        {status === "waiting" ? (
          <>
            {UploadButonMessage(status)}
            <Upload className="w-4 h-4 ml-2" />
          </>
        ) : (
          <>{UploadButonMessage(status)}</>
        )}
      </Button>
    </form>
  );
}
