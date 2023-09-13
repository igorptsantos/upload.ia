import { Github } from "lucide-react";
import { Button } from "./components/ui/button";
import { Separator } from "./components/ui/separator";
import { Textarea } from "./components/ui/textarea";

export function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 py-3 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">Upload.ai</h1>

        <div className="flex items-center gap-3">
          {/* text-muted-foreground => Cor cinza claro do shadcn/ui => Utilizado em textos com menor destaque */}
          <span className="text-sm text-muted-foreground">
            Desenvolvido com 💜 no NLW da Rocketseat
          </span>

          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline">
            <Github className="m-4 h-4 mr-2" />
            Github
          </Button>
        </div>
      </div>

      {/* flex-1 => Força que o elemento cresça para ocupar o restante do espaço */}
      <main className="flex-1 p-6 flex gap-6">
        {/* Prompts */}
        <div className="flex flex-col flex-1 gap-4">
          <div className="grid grid-rows-2 gap-4 flex-1">
            <Textarea />
            <Textarea />
          </div>
          <p>
            Lembre-se: você pode utilizar a variável{" "}
            <code className="text-violet-400"> {"{transcription}"} </code> no
            seu prompt para adicionar o conteúdo da transcrição do video
            selecionado
          </p>
        </div>

        {/* Sidebar */}
        <aside className="w-80"></aside>
      </main>
    </div>
  );
}
