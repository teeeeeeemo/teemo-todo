insert into todo ( created_at, is_done, task_name, updated_at, item_id ) values ( '20200402 00:00', false, '티모 대위 출동하기', '20200402 00:00', 1 );
insert into todo ( created_at, is_done, task_name, updated_at, item_id ) values ( '20200402 00:10', false, '티모 대위 실명 배우기 Q', '20200402 00:10', 2 );
insert into todo ( created_at, is_done, task_name, updated_at, item_id ) values ( '20200402 00:20', false, '티모 대위 버섯 배우기 (울티) R', '20200402 00:20', 3 );
insert into todo ( created_at, is_done, task_name, updated_at, item_id ) values ( '20200402 00:30', false, '티모 대위 빨리걷기 배우기 W', '20200402 00:30', 4 );
insert into todo ( created_at, is_done, task_name, updated_at, item_id ) values ( '20200403 00:00', false, '티모 대위 스킬 마스터하기', '20200403 00:00', 5 );
insert into todo ( created_at, is_done, task_name, updated_at, item_id ) values ( '20200403 00:10', false, '티모 대위 16까지 렙업하기', '20200402 00:10', 6 );
insert into todo ( created_at, is_done, task_name, updated_at, item_id ) values ( '20200404 00:10', true, '티모 대위 라인전 열심히 하기', '20200405 00:10', 7 );
insert into todo ( created_at, is_done, task_name, updated_at, item_id ) values ( '20200404 00:11', false, '티모 대위 한타 참여하기', '20200404 00:11', 8 );
insert into todo ( created_at, is_done, task_name, updated_at, item_id ) values ( '20200405 00:22', false, '베인에게 실명 걸기', '20200405 00:22', 9 );
insert into todo ( created_at, is_done, task_name, updated_at, item_id ) values ( '20200405 00:33', true, '라인전에서 부쉬 플레이 하기', '20200405 00:33', 10 );


insert into todo_child (child_id, parent_id, item_id, id) values (2, 5, 5, 1);
insert into todo_child (child_id, parent_id, item_id, id) values (3, 5, 5, 2);
insert into todo_child (child_id, parent_id, item_id, id) values (6, 5, 5, 3);
insert into todo_child (child_id, parent_id, item_id, id) values (4, 5, 5, 4);
insert into todo_child (child_id, parent_id, item_id, id) values (10, 7, 7, 5);
