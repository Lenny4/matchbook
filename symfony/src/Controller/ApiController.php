<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\EventJson;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api")
 */
class ApiController extends AbstractController
{
    /**
     * @Route("/demo", name="demo")
     */
    public function index()
    {
        return $this->json(true);
    }

    /**
     * @Route("/save-event", name="save_event")
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     * @throws \Exception
     */
    public function saveEvent(Request $request)
    {
        ini_set('memory_limit', '-1');
        try {
            $em = $this->getDoctrine()->getManager();
            $eventId = $request->request->get('id');
            $name = $request->request->get('name');
            $start = intval($request->request->get('start'));
            $sportId = $request->request->get('sport-id');
            if ($sportId === null) {
                $sportId = "";
            }
            $event = $request->request->get('event');
            $eventEntity = new Event();
            $eventJsonEntity = new EventJson();
            $eventEntity->setName($name);
            $eventEntity->setStart($start);
            $eventEntity->setEventId($eventId);
            $eventEntity->setSportId($sportId);
            $eventJsonEntity->setJson($event);
            $eventEntity->setJson($eventJsonEntity);
            $em->persist($eventEntity);
            $em->flush();
            return $this->json(true);
        } catch (\Exception $e) {
            return $this->json($e->getMessage());
        }
    }

    /**
     * @Route("/get-all-events", name="get_all_events")
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getAllEvents()
    {
        $em = $this->getDoctrine()->getManager();
        $eventRepository = $em->getRepository("App\Entity\Event");
        return $this->json($eventRepository->getAllEvents());
    }

    /**
     * @Route("/get-event", name="get_event")
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getEvent(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $id = $request->request->get('id');
        $eventRepository = $em->getRepository("App\Entity\Event");
        $event = $eventRepository->find($id);
        if ($event instanceof Event) {
            $eventJson = $event->getJson();
            if ($eventJson instanceof EventJson) {
                return $this->json($eventJson->getJson());
            }
        }
        return $this->json(false);
    }
}
