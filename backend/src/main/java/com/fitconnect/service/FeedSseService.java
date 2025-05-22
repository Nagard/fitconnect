package com.fitconnect.service;

import com.fitconnect.entity.Activity;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class FeedSseService {

    private final List<SseEmitter> clients = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30 Minuten
        clients.add(emitter);

        emitter.onCompletion(() -> clients.remove(emitter));
        emitter.onTimeout(() -> clients.remove(emitter));
        emitter.onError(e -> clients.remove(emitter));

        return emitter;
    }

    public void broadcast(Activity activity) {
        for (SseEmitter emitter : clients) {
            try {
                emitter.send(SseEmitter.event()
                    .name("activity")
                    .data(activity));
            } catch (IOException e) {
                emitter.complete();
                clients.remove(emitter);
            }
        }
    }

    public void broadcastUpdate(Activity activity) {
        for (SseEmitter emitter : clients) {
            try {
                emitter.send(SseEmitter.event()
                    .name("activity-update")
                    .data(activity));
            } catch (IOException e) {
                emitter.complete();
                clients.remove(emitter);
            }
        }
    }
    
    public void broadcastDelete(Long activityId) {
        System.out.println("📣 DELETE wird gesendet an " + clients.size() + " Clients für ID " + activityId);
    
        for (SseEmitter emitter : clients) {
            try {
                emitter.send(SseEmitter.event()
                    .name("activity-delete")
                    .data(activityId));
            } catch (IOException e) {
                System.out.println("❌ Fehler beim Senden an einen Client: " + e.getMessage());
                emitter.complete();
                clients.remove(emitter);
            }
        }
    }


    public void broadcastFriendRequest(String targetUsername) {
        for (SseEmitter emitter : clients) {
            try {
                emitter.send(SseEmitter.event()
                    .name("friend-request")
                    .data(targetUsername));
            } catch (IOException e) {
                emitter.complete();
                clients.remove(emitter);
            }
        }
    }
}
