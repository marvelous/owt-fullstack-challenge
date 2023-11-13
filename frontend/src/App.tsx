import 'bootstrap/dist/css/bootstrap.css';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Alert, Button, Col, Container, Form, ListGroup, Row, Stack, Toast, ToastContainer } from 'react-bootstrap';

// Communication utilities for the backend
type Backend = {
  get: (resource: string) => Promise<any>;
  send: (resource: string, method: 'PATCH' | 'PUT' | 'POST', body: object) => Promise<void>;
  remove: (resource: string) => Promise<void>;
};

// Wraps form event handlers, cancelling default browser behavior
const formEvent = (handler: () => void) => {
  return (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handler();
  };
};

// Wraps change event handlers, extracting the target value
const changeEvent = (handler: (value: string) => void) => {
  return (event: ChangeEvent<HTMLInputElement>) => {
    handler(event.target.value);
  };
};

// Removes the Hypertext Application Language "_links" entry
const parseJsonObject = (json: any) => {
  const { _links, ...data } = json;
  return data;
};

type BoatData = {
  name: string;
  description: string;
};
type Boat = BoatData & {
  id: number;
};
type BoatNew = BoatData & {
  id: undefined;
};

const boatSort = (boats: Boat[]) => boats.sort((b1, b2) => b1.name.localeCompare(b2.name));

const boatNew = (): BoatNew => ({
  id: undefined,
  name: '',
  description: '',
});

// Action classes
class BoatSelect { constructor(public boat: Boat | BoatNew) { } }
class BoatCreate { constructor(public boat: BoatNew) { } }
class BoatUpdate { constructor(public boat: Boat) { } }
class BoatDelete { constructor(public boat: Boat) { } }
type Action = BoatSelect | BoatCreate | BoatUpdate | BoatDelete;
type ActionHandler = (action: Action) => Promise<void>;

function BoatList({ boats, activeBoat, onAction }: { boats: Boat[], activeBoat: Boat | BoatNew, onAction: ActionHandler }) {
  const boatSelect = (boat: Boat | BoatNew) => {
    onAction(new BoatSelect(boat));
  }
  return (
    <ListGroup>
      <ListGroup.Item action active={activeBoat.id === undefined} onClick={() => boatSelect(boatNew())}>
        New boat...
      </ListGroup.Item>
      {boats.map(boat =>
        <ListGroup.Item action active={activeBoat.id === boat.id} onClick={() => boatSelect(boat)} key={boat.id}>
          {boat.name}
        </ListGroup.Item>
      )}
    </ListGroup>
  );
}

function BoatForm({ boat, onAction }: { boat: Boat | BoatNew, onAction: ActionHandler }) {
  enum State {
    Ready,
    Busy,
  }
  const [state, setState] = useState<State>(State.Ready);
  const [name, setName] = useState(boat.name);
  const [description, setDescription] = useState(boat.description);
  const dirty = name !== boat.name || description !== boat.description;

  const handleSubmit = () => {
    setState(State.Busy);
    const boatNew = { ...boat, name, description };
    const action = boatNew.id === undefined ? new BoatCreate(boatNew) : new BoatUpdate(boatNew);
    onAction(action).then(() => setState(State.Ready));
  }

  const handleReset = () => {
    setName(boat.name);
    setDescription(boat.description);
  }

  const handleDelete = () => {
    setState(State.Busy);
    onAction(new BoatDelete(boat as Boat)).then(() => setState(State.Ready));
  }

  return (
    <Form onSubmit={formEvent(handleSubmit)} onReset={formEvent(handleReset)}>
      <fieldset disabled={state === State.Busy}>
        <Stack gap={3}>
          <Form.Group controlId="BoatName">
            <Form.Label>Boat name</Form.Label>
            <Form.Control autoFocus required type="text" value={name} onChange={changeEvent(setName)} />
          </Form.Group>
          <Form.Group controlId="BoatDescription">
            <Form.Label>Boat description</Form.Label>
            <Form.Control required as="textarea" rows={3} value={description} onChange={changeEvent(setDescription)} />
          </Form.Group>
          <Stack direction="horizontal">
            <Button variant="primary" type="submit" disabled={!dirty}>{boat.id ? 'Save' : 'Create'}</Button>
            <Button variant="secondary" type="reset" disabled={!dirty}>Cancel</Button>
            {boat.id && <Button variant="danger" onClick={handleDelete}>Delete</Button>}
          </Stack>
        </Stack>
      </fieldset>
    </Form>
  );
}

function LoadedApp({ backend, boatsSeed }: { backend: Backend, boatsSeed: Boat[] }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [boats, setBoats] = useState<Boat[]>(boatsSeed);
  const [activeBoat, setActiveBoat] = useState<Boat | BoatNew>(boatNew());

  const pushMessage = (message: string) => {
    const messagesNew = [...messages, message];
    setMessages(messagesNew);
  }
  const popMessage = () => {
    const messagesNew = messages.slice(1);
    setMessages(messagesNew);
  }

  const handleAction: ActionHandler = async action => {
    if (action instanceof BoatSelect) {
      setActiveBoat(action.boat);
    } else if (action instanceof BoatCreate) {
      const json = await backend.send('/api/boats', 'POST', action.boat);
      const boat = parseJsonObject(json);
      setBoats(boatSort([...boats, boat]));
      setActiveBoat(boat);
      pushMessage('Boat created successfully');
    } else if (action instanceof BoatUpdate) {
      const { id, ...data } = action.boat;
      const json = await backend.send(`/boats/${id}`, 'PATCH', data);
      const boatNew = parseJsonObject(json);
      setBoats(boatSort(boats.map(boat => boat.id === boatNew.id ? boatNew : boat)));
      pushMessage('Boat modified successfully');
    } else if (action instanceof BoatDelete) {
      await backend.remove(`/boats/${action.boat.id}`);
      setBoats(boats.filter(boat => boat.id !== action.boat.id));
      setActiveBoat(boatNew());
      pushMessage('Boat deleted successfully');
    }
  }

  return <>
    <ToastContainer position="bottom-center">
      {messages.map((message, index) => (
        <Toast key={index} autohide onClose={popMessage}><Toast.Body>{message}</Toast.Body></Toast>
      ))}
    </ToastContainer>
    <Row>
      <Col sm>
        <BoatList boats={boats} activeBoat={activeBoat} onAction={handleAction} />
      </Col>
      <Col sm>
        <BoatForm key={activeBoat.id} onAction={handleAction} boat={activeBoat} />
      </Col>
    </Row>
  </>;
}

function AuthenticatedApp({ backend }: { backend: Backend }) {
  const [boats, setBoats] = useState<Boat[] | undefined>(undefined);

  if (boats === undefined) {
    backend.get('/api/boats').then(response => {
      setBoats(boatSort(response._embedded.boats.map(parseJsonObject)));
    });
    return <></>;
  } else {
    return <LoadedApp backend={backend} boatsSeed={boats} />;
  }

}

function LoginForm({ onAuthorized }: { onAuthorized: (backend: Backend) => void }) {
  enum State {
    Ready,
    Busy,
    Unauthorized,
  }
  const [state, setState] = useState<State>(State.Ready);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('hunter2');

  const handleSubmit = () => {
    setState(State.Busy);

    const credentials = `${username}:${password}`;
    const authorization = `Basic ${btoa(credentials)}`;
    const headers = { 'Authorization': authorization };

    const bring: typeof fetch = async (resource, options) => {
      const response = await fetch(resource, options);
      if (!response.ok) {
        throw response;
      }
      return response;
    }

    const get: Backend['get'] = async (resource) => {
      const options = {
        method: 'GET',
        headers,
      };
      const response = await bring(resource, options);
      return await response.json();
    }

    get('/api/profile').catch(error => {

      if (!(error instanceof Response) || error.status !== 401) {
        throw error;
      }
      setState(State.Unauthorized);

    }).then(() => {

      const send: Backend['send'] = async (resource, method, body) => {
        const options = {
          method,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        };
        const response = await bring(resource, options);
        return await response.json();
      };

      const remove: Backend['remove'] = async (resource) => {
        const options = {
          method: 'DELETE',
          headers,
        };
        await bring(resource, options);
      }

      const backend = {
        get,
        send,
        remove,
      };
      onAuthorized(backend);

    });
  }

  return (
    <Form onSubmit={formEvent(handleSubmit)}>
      <fieldset disabled={state === State.Busy}>
        <Stack gap={3} >
          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control required type="text" value={username} onChange={changeEvent(setUsername)} />
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control required type="password" value={password} onChange={changeEvent(setPassword)} />
          </Form.Group>
          {state === State.Unauthorized && <Alert>Invalid username or password. Try with <code>admin</code> and <code>hunter2</code></Alert>}
          <Button variant="primary" type="submit">Login</Button>
        </Stack>
      </fieldset>
    </Form>
  );
}

function App() {
  const [backend, setBackend] = useState<Backend | undefined>();
  const content = backend ? <AuthenticatedApp backend={backend} /> : <LoginForm onAuthorized={setBackend} />;
  return (
    <Container>
      <h1>Boat App</h1>
      {content}
    </Container>
  );
}

export default App;
