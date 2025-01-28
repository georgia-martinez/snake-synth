import pyaudio
import numpy as np
import socket

class Synth:
    def __init__(self, rate=44100, chunk=1024):
        self.audio = pyaudio.PyAudio()
        self.stream = self.audio.open(
            format=pyaudio.paFloat32,
            channels=1,
            rate=rate,
            output=1,
            frames_per_buffer=chunk,
        )
        self.stream.stop_stream()

        self.frequency = 440
        self.rate = rate
        self.chunk = chunk

    def toggle(self):
        if self.stream.is_active():
            self.stream.stop_stream()
        elif self.stream.is_stopped():
            self.stream.start_stream()
            self.play()

    def play(self):
        start = 0
        end = self.chunk

        while self.stream.is_active():
            self.x = np.arange(start, end) / self.rate
            self.y = np.sin(2 * np.pi * self.frequency * self.x)

            chunk = self.y

            self.stream.write(
                chunk.astype(np.float32).tobytes()
            )

            start = end
            end += self.chunk

if __name__ == "__main__":
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(("127.0.0.1", 1337))
    server.listen(1)
    print("Waiting for a connection...")

    conn, addr = server.accept()
    print(f"Connected by {addr}")

    synth = Synth()
    synth.toggle()